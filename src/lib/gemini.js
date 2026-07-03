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
