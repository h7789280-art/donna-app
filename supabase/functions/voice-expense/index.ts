// supabase/functions/voice-expense/index.ts
//
// Edge Function: голосовой ввод трат через Gemini 2.5 Flash (audio).
// Принимает аудиозапись (base64), где пользователь голосом называет свои траты,
// + дерево категорий юзера → Gemini распознаёт речь и разбирает её в одну ИЛИ
// несколько трат: { items: [{ name, amount, category_id, subcategory_id }] }.
// По образцу scan-receipt: та же CORS-обвязка, тот же разбор ответа Gemini.
// Деплой: автоматически через GitHub Actions (.github/workflows/deploy-functions.yml)
//   при push в main с изменениями в supabase/functions/**.
//   Ручной запасной вариант: supabase functions deploy voice-expense
// Секрет GEMINI_API_KEY уже заведён в Supabase (Project Settings → Edge Functions → Secrets).

// deno-lint-ignore-file no-explicit-any

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  // CORS preflight — иначе браузер заблокирует вызов из PWA.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return json({ error: 'GEMINI_API_KEY не настроен на сервере' }, 500)
  }

  // Разбор тела запроса.
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Некорректный JSON в теле запроса' }, 400)
  }

  const { audio, mimeType, categories, language } = payload ?? {}

  // Валидация: без аудио распознавать нечего.
  if (typeof audio !== 'string' || !audio.trim()) {
    return json({ error: 'audio пуст — нечего распознавать' }, 400)
  }

  const lang = typeof language === 'string' && language ? language : 'ru'
  const mime = typeof mimeType === 'string' && mimeType ? mimeType : 'audio/webm'

  // Дерево категорий юзера. В промпт отдаём только расходные (type='expense'):
  // голосом человек называет свои траты.
  const cats = Array.isArray(categories) ? categories : []
  const expenseCats = cats
    .filter((c: any) => c?.type === 'expense' && c?.id && c?.name)
    .map((c: any) => ({
      id: String(c.id),
      name: String(c.name),
      parent_id: c.parent_id ? String(c.parent_id) : null,
    }))

  // Компактный список категорий для промпта: родители и их подкатегории.
  const catLines = expenseCats
    .map((c) =>
      c.parent_id
        ? `  подкатегория id=${c.id} name="${c.name}" родитель=${c.parent_id}`
        : `категория id=${c.id} name="${c.name}"`,
    )
    .join('\n')

  const instruction = [
    `Это аудиозапись, где пользователь голосом называет свои траты на языке с кодом "${lang}"`,
    `(например: «потратила 200 на такси и 150 на кофе»).`,
    `Распознай речь и извлеки ВСЕ упомянутые траты — их может быть одна или несколько.`,
    ``,
    `Для КАЖДОЙ траты верни:`,
    `- name: краткое описание траты на языке "${lang}" (например «Такси», «Кофе»).`,
    `- amount: сумму этой траты (число).`,
    `- category_id: id родительской категории СТРОГО из списка ниже, к которой относится трата. Если подобрать нельзя — null.`,
    `- subcategory_id: id подкатегории СТРОГО из списка ниже (её родитель должен совпадать с category_id). Если подходящей нет — null.`,
    ``,
    `Если сумма или трата не распознаны — НЕ выдумывай, просто пропусти.`,
    `Если в записи нет ни одной траты — верни пустой список items.`,
    ``,
    `Список категорий пользователя (только расходы). Используй ТОЛЬКО эти id, НЕ выдумывай категории, которых нет в списке:`,
    catLines || '(список пуст — тогда category_id и subcategory_id всегда null)',
    ``,
    `Верни СТРОГО валидный компактный JSON без лишних пробелов, без markdown, без \`\`\`json, ровно такой формат:`,
    `{"items":[{"name":"Такси","amount":200,"category_id":"<uuid|null>","subcategory_id":"<uuid|null>"}]}`,
  ].join('\n')

  // Мультимодальный запрос: текст-инструкция + inline-аудио.
  let geminiRes: Response
  try {
    geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: instruction },
              { inline_data: { mime_type: mime, data: audio } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })
  } catch (e) {
    return json(
      { error: `Не удалось обратиться к Gemini: ${(e as Error)?.message ?? e}` },
      502,
    )
  }

  if (!geminiRes.ok) {
    const detail = await geminiRes.text().catch(() => '')
    return json(
      { error: `Ошибка Gemini API (${geminiRes.status}): ${detail.slice(0, 500)}` },
      502,
    )
  }

  let data: any
  try {
    data = await geminiRes.json()
  } catch {
    return json({ error: 'Gemini вернул некорректный JSON' }, 502)
  }

  const finishReason = data?.candidates?.[0]?.finishReason

  // Обрезанный по лимиту токенов ответ парсить бессмысленно — JSON заведомо
  // неполный. Просим пользователя записать короче.
  if (finishReason === 'MAX_TOKENS') {
    return json(
      { error: 'Слишком длинная запись, попробуй назвать траты короче' },
      502,
    )
  }

  const raw: string = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: any) => p?.text)
    .filter(Boolean)
    .join('')
    .trim()

  if (!raw) {
    // Пустой ответ модели — трактуем как «не расслышала»: клиент покажет мягкое
    // сообщение и предложит записать заново.
    return json({ items: [] })
  }

  // Defensive: срезаем возможную ```json ... ``` обёртку, если модель её добавила.
  let cleaned = raw
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()
  }

  let parsed: any
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    // Парсинг не удался — отдаём сырой текст для отладки на клиенте.
    return json(
      { error: `Не удалось разобрать ответ Gemini как JSON: ${raw.slice(0, 1000)}` },
      502,
    )
  }

  // Нормализуем ответ клиенту: только ожидаемые поля.
  const items = Array.isArray(parsed?.items)
    ? parsed.items
      .map((it: any) => ({
        name: typeof it?.name === 'string' ? it.name : '',
        amount: Number(it?.amount) || 0,
        category_id: it?.category_id ? String(it.category_id) : null,
        subcategory_id: it?.subcategory_id ? String(it.subcategory_id) : null,
      }))
      // Отсекаем пустышки без суммы — их нельзя сохранить как трату.
      .filter((it: any) => it.amount > 0)
    : []

  return json({ items })
})
