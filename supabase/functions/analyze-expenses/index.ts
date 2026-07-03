// supabase/functions/analyze-expenses/index.ts
//
// Edge Function: AI-разбор расходов в голосе Донны Полсен через Gemini 2.5 Flash.
// Первая интеграция Gemini в проекте. Деплой вручную:
//   supabase functions deploy analyze-expenses
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

  const { summary, currency, period_label, language } = payload ?? {}

  // Валидация: без сводки анализировать нечего.
  if (!Array.isArray(summary) || summary.length === 0) {
    return json({ error: 'summary пуст — анализировать нечего' }, 400)
  }

  const lang = typeof language === 'string' && language ? language : 'ru'
  const cur = typeof currency === 'string' ? currency : ''
  const periodLabel = typeof period_label === 'string' ? period_label : ''

  // Собираем компактную сводку по категориям для промпта.
  const rows = summary
    .map((r: any) => ({
      category: typeof r?.category === 'string' && r.category ? r.category : '—',
      amount: Number(r?.amount) || 0,
    }))
    .filter((r) => r.amount > 0)

  if (rows.length === 0) {
    return json({ error: 'summary не содержит сумм — анализировать нечего' }, 400)
  }

  const total = rows.reduce((s, r) => s + r.amount, 0)
  const lines = rows.map((r) => `- ${r.category}: ${r.amount}`).join('\n')

  const prompt = [
    `Ты — Донна Полсен из сериала "Suits". Тон: дерзко-тёплый, умный, с лёгкой подколкой, но информация первична.`,
    `Проанализируй траты пользователя по категориям за период "${periodLabel}". Валюта: ${cur}.`,
    `Ответ: 2–4 коротких предложения связным текстом (без списков, без заголовков, без markdown). Скажи, на что ушло больше всего — с процентом и суммой. Добавь один живой наблюдательный инсайт. Без морализаторства и без советов «экономь».`,
    `ОБЯЗАТЕЛЬНО отвечай на языке интерфейса пользователя с кодом: ${lang}.`,
    `Пользователь — женщина. В языках с грамматическим родом (ru, uk, be, pl и подобных) обращайся к ней в ЖЕНСКОМ роде: «ты потратила», «ты купила», «ты выбрала» — никогда в мужском. В языках без грамматического рода (например en) ничего не меняй, пиши естественно.`,
    ``,
    `Итого потрачено: ${total} ${cur}. Траты по категориям:`,
    lines,
  ].join('\n')

  // Вызов Gemini. Любые сбои ловим и отдаём 502, не роняя функцию.
  let geminiRes: Response
  try {
    geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 800,
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

  const insight: string = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: any) => p?.text)
    .filter(Boolean)
    .join('')
    .trim()

  if (!insight) {
    return json({ error: 'Gemini вернул пустой ответ' }, 502)
  }

  // Защита от тихой обрезки: если модель упёрлась в лимит токенов, ответ
  // может быть неполным. Сам текст всё равно отдаём, но факт логируем.
  if (data?.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
    console.warn(
      'Gemini finishReason=MAX_TOKENS: ответ мог оборваться, стоит поднять maxOutputTokens',
    )
  }

  return json({ insight })
})
