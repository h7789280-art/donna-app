import { supabase } from './supabase'

// Клиентский хелпер над Edge Function `analyze-expenses`.
// Собранную сводку трат отправляем в функцию, та вызывает Gemini и возвращает
// текст-инсайт в тоне Донны. Возвращаем строку insight или бросаем ошибку.
//
// @param {Object}   opts
// @param {Array<{category: string, amount: number}>} opts.summary — сводка по категориям
// @param {string}   opts.currency    — код валюты (TRY / USD / …)
// @param {string}   opts.periodLabel — человекочитаемый ярлык периода
// @param {string}   opts.language    — код языка интерфейса (i18n.language)
// @returns {Promise<string>} текст инсайта
export async function analyzeExpenses({ summary, currency, periodLabel, language }) {
  const { data, error } = await supabase.functions.invoke('analyze-expenses', {
    body: {
      summary,
      currency,
      period_label: periodLabel,
      language,
    },
  })

  if (error) {
    // FunctionsHttpError оборачивает не-2xx ответ — вытащим серверное сообщение.
    let message = error.message
    try {
      const ctx = await error.context?.json?.()
      if (ctx?.error) message = ctx.error
    } catch {
      /* тело недоступно — оставляем message как есть */
    }
    throw new Error(message || 'analyze-expenses failed')
  }

  if (!data?.insight) {
    throw new Error('Пустой ответ от analyze-expenses')
  }

  return data.insight
}

// Клиентский хелпер над Edge Function `scan-receipt`.
// Отправляем фото чека (base64) + дерево категорий юзера, функция вызывает
// Gemini (vision) и возвращает структуру { date, total, items }.
// Каждая позиция: { name, amount, category_id, subcategory_id }.
//
// @param {Object}  opts
// @param {string}  opts.image      — base64 картинки чека (без data:-префикса)
// @param {string}  opts.mimeType   — 'image/jpeg' | 'image/png'
// @param {Array<{id, name, type, parent_id}>} opts.categories — дерево категорий юзера
// @param {string}  opts.language   — код языка интерфейса (i18n.language)
// @returns {Promise<{date: string|null, total: number, items: Array}>}
export async function scanReceipt({ image, mimeType, categories, language }) {
  const { data, error } = await supabase.functions.invoke('scan-receipt', {
    body: {
      image,
      mimeType,
      categories,
      language,
    },
  })

  if (error) {
    // FunctionsHttpError оборачивает не-2xx ответ — вытащим серверное сообщение.
    let message = error.message
    try {
      const ctx = await error.context?.json?.()
      if (ctx?.error) message = ctx.error
    } catch {
      /* тело недоступно — оставляем message как есть */
    }
    throw new Error(message || 'scan-receipt failed')
  }

  if (!data || !Array.isArray(data.items)) {
    throw new Error('Пустой ответ от scan-receipt')
  }

  return data
}

// Клиентский хелпер над Edge Function `voice-expense`.
// Отправляем аудиозапись (base64), где пользователь голосом называет траты,
// + дерево категорий юзера. Функция вызывает Gemini (audio) — он распознаёт речь
// и разбирает её в одну или несколько трат. Возвращаем { items } или бросаем ошибку.
// Каждая позиция: { name, amount, category_id, subcategory_id }.
//
// @param {Object}  opts
// @param {string}  opts.audio      — base64 аудио (без data:-префикса)
// @param {string}  opts.mimeType   — 'audio/webm' | 'audio/mp4' | …
// @param {Array<{id, name, type, parent_id}>} opts.categories — дерево категорий юзера
// @param {string}  opts.language   — код языка интерфейса (i18n.language)
// @returns {Promise<{items: Array}>}
export async function voiceExpense({ audio, mimeType, categories, language }) {
  const { data, error } = await supabase.functions.invoke('voice-expense', {
    body: {
      audio,
      mimeType,
      categories,
      language,
    },
  })

  if (error) {
    // FunctionsHttpError оборачивает не-2xx ответ — вытащим серверное сообщение.
    let message = error.message
    try {
      const ctx = await error.context?.json?.()
      if (ctx?.error) message = ctx.error
    } catch {
      /* тело недоступно — оставляем message как есть */
    }
    throw new Error(message || 'voice-expense failed')
  }

  if (!data || !Array.isArray(data.items)) {
    throw new Error('Пустой ответ от voice-expense')
  }

  return data
}
