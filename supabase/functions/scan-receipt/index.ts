// supabase/functions/scan-receipt/index.ts
//
// Edge Function: распознавание магазинного чека через Gemini 2.5 Flash (vision).
// Принимает фото чека (base64) + дерево категорий юзера → возвращает
// структурированный JSON: дата, итог, список позиций с переводом названий
// и привязкой к категории/подкатегории юзера.
// Деплой: автоматически через GitHub Actions (.github/workflows/deploy-functions.yml)
//   при push в main с изменениями в supabase/functions/**.
//   Ручной запасной вариант: supabase functions deploy scan-receipt
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
    return json(
      { error: 'GEMINI_API_KEY не настроен на сервере' },
      500,
    )
  }

  // Разбор тела запроса.
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Некорректный JSON в теле запроса' }, 400)
  }

  const { image, mimeType, categories, language } = payload ?? {}

  // Валидация: без картинки распознавать нечего.
  if (typeof image !== 'string' || !image.trim()) {
    return json({ error: 'image пуст — нечего распознавать' }, 400)
  }

  const lang = typeof language === 'string' && language ? language : 'ru'
  const mime = typeof mimeType === 'string' && mimeType ? mimeType : 'image/jpeg'

  // Дерево категорий юзера. В промпт отдаём только расходные (type='expense'):
  // распознаём чек магазина — это всегда траты.
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
    `Ты читаешь фотографию магазинного чека (часто на турецком языке).`,
    `Извлеки из чека:`,
    `- date: дату чека в формате ISO YYYY-MM-DD; если даты нет — null.`,
    `- total: итоговую сумму чека (число).`,
    `- items: список всех позиций (товаров).`,
    ``,
    `Для КАЖДОЙ позиции верни:`,
    `- name: название товара, ПЕРЕВЕДЁННОЕ на язык с кодом "${lang}" (например турецкое "Süt" → "Молоко", "Ekmek" → "Хлеб").`,
    `- amount: сумму этой позиции (число).`,
    `- category_id: id родительской категории СТРОГО из списка ниже, к которой относится товар. Если подобрать нельзя — null.`,
    `- subcategory_id: id подкатегории СТРОГО из списка ниже (её родитель должен совпадать с category_id). Если подходящей подкатегории нет — null.`,
    ``,
    `Список категорий пользователя (только расходы). Используй ТОЛЬКО эти id, НЕ выдумывай категории, которых нет в списке:`,
    catLines || '(список пуст — тогда category_id и subcategory_id всегда null)',
    ``,
    `Верни СТРОГО валидный компактный JSON без лишних пробелов, без markdown, без \`\`\`json, ровно такой формат:`,
    `{"date":"2026-07-03"|null,"total":350.00,"items":[{"name":"Молоко","amount":45.00,"category_id":"<uuid|null>","subcategory_id":"<uuid|null>"}]}`,
  ].join('\n')

  // Мультимодальный запрос: текст-инструкция + inline-картинка чека.
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
              { inline_data: { mime_type: mime, data: image } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
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
  // неполный. Просим пользователя снять чек по частям.
  if (finishReason === 'MAX_TOKENS') {
    return json(
      { error: 'Чек слишком длинный, попробуй сфотографировать по частям' },
      502,
    )
  }

  const raw: string = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: any) => p?.text)
    .filter(Boolean)
    .join('')
    .trim()

  if (!raw) {
    return json({ error: 'Gemini вернул пустой ответ' }, 502)
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
  const result = {
    date: typeof parsed?.date === 'string' ? parsed.date : null,
    total: Number(parsed?.total) || 0,
    items: Array.isArray(parsed?.items)
      ? parsed.items.map((it: any) => ({
        name: typeof it?.name === 'string' ? it.name : '',
        amount: Number(it?.amount) || 0,
        category_id: it?.category_id ? String(it.category_id) : null,
        subcategory_id: it?.subcategory_id ? String(it.subcategory_id) : null,
      }))
      : [],
  }

  return json(result)
})
