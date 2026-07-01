import { formatMoney } from '../../lib/currencies'

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// One category line: colour dot (matches its donut segment), name, amount in the
// currency's own formatting, and the share % in small muted text. Top-level rows
// are clickable (drill-down, shows a chevron); subcategory rows are static.
export default function ReportRow({ color, name, sum, share, currencyCode, onClick }) {
  const clickable = typeof onClick === 'function'
  const shareLabel = `${Math.round(Number(share) || 0)}%`

  const inner = (
    <>
      <span
        className="shrink-0 h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate font-sans text-md text-ink">{name}</span>
      <span className="shrink-0 font-mono text-xs uppercase tracking-caps text-ink-muted">
        {shareLabel}
      </span>
      <span className="shrink-0 font-sans text-md text-ink tabular-nums">
        {formatMoney(sum, currencyCode)}
      </span>
      {clickable && (
        <span className="shrink-0 text-ink-muted">
          <ChevronIcon />
        </span>
      )}
    </>
  )

  if (clickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 py-3.5 text-left hover:opacity-80 transition-opacity cursor-pointer"
      >
        {inner}
      </button>
    )
  }

  return <div className="w-full flex items-center gap-3 py-3.5">{inner}</div>
}
