import { useTranslation } from 'react-i18next'
import { getCurrency } from '../../lib/currencies'

// One row of the operations feed. Expense amounts render with a minus in the
// error tone (terracotta); income with a plus in the success tone (sage). The
// stored category is already the leaf name, so we just show it plus an optional
// small note underneath. Amounts stay in the wallet's own currency — no
// conversion anywhere in the app.
function TrashGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// "1 июл" — short day+month in the active locale.
function formatShortDate(iso, locale) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  try {
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  } catch {
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  }
}

export default function TransactionRow({ tx, onDelete }) {
  const { t, i18n } = useTranslation()
  const isIncome = tx.kind === 'income'
  const symbol = getCurrency(tx.currency).symbol
  const value = Number(tx.amount) || 0
  const formatted = value.toLocaleString(i18n.language, { maximumFractionDigits: 2 })
  const sign = isIncome ? '+' : '−'
  const amountTone = isIncome ? 'text-success' : 'text-error'
  const categoryLabel = tx.category || t('finance.history.no_category')

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-sans text-md text-ink truncate">{categoryLabel}</p>
        {tx.description ? (
          <p className="font-sans text-sm text-ink-soft truncate">{tx.description}</p>
        ) : null}
        <p className="font-mono text-xs uppercase tracking-caps text-ink-muted mt-0.5">
          {formatShortDate(tx.date, i18n.language)}
        </p>
      </div>

      <span className={`shrink-0 font-sans text-md font-medium tabular-nums ${amountTone}`}>
        {sign}{formatted} {symbol}
      </span>

      <button
        type="button"
        onClick={() => onDelete?.(tx)}
        aria-label={t('finance.history.delete')}
        className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-pill text-ink-muted hover:bg-error-soft hover:text-error transition-colors cursor-pointer"
      >
        <TrashGlyph />
      </button>
    </div>
  )
}
