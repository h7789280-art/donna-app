// Supported wallet currencies. Each wallet holds amounts in its OWN currency —
// there is no conversion anywhere in the app. `symbol` is a display glyph and
// `nameKey` points at an i18n string (currencies.<code>) for the human name.
export const CURRENCIES = [
  { code: 'TRY', symbol: '₺' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'RUB', symbol: '₽' },
  { code: 'GBP', symbol: '£' },
  { code: 'UAH', symbol: '₴' },
  { code: 'KZT', symbol: '₸' },
  { code: 'AZN', symbol: '₼' },
  { code: 'GEL', symbol: '₾' },
  { code: 'AMD', symbol: '֏' },
].map((c) => ({ ...c, nameKey: `currencies.${c.code}` }))

const BY_CODE = Object.fromEntries(CURRENCIES.map((c) => [c.code, c]))

// Default for the currency selector — matches the primary audience (TR).
export const DEFAULT_CURRENCY = 'TRY'

// getCurrency(code) -> { code, symbol, nameKey }. Never throws: an unknown code
// falls back to itself as the symbol so the UI degrades gracefully.
export function getCurrency(code) {
  return BY_CODE[code] || { code, symbol: code, nameKey: `currencies.${code}` }
}

// Format an amount in the wallet's own currency via Intl. If Intl doesn't know
// the ISO code we fall back to "<symbol> <number>" so we never crash.
export function formatMoney(amount, code) {
  const value = Number(amount) || 0
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    const { symbol } = getCurrency(code)
    return `${symbol} ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }
}
