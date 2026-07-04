import { useTranslation } from 'react-i18next'
import Card from '../ui/Card'
import ReportBars from './ReportBars'

// Amount without the currency glyph, locale-formatted, no fraction noise.
function fmt(amount) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number(amount) || 0
  )
}

function hasAny(data) {
  return (data || []).some((d) => Number(d.value) > 0)
}

const sectionTitle = 'font-serif italic text-xl text-ink mb-3'
const emptyLine = 'font-sans text-sm text-ink-muted text-center py-8'

function ArrowIcon({ up }) {
  // Up = spending grew; down = spending fell. currentColor follows the tone.
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d={up ? 'M6 2.5v7M3 5.5L6 2.5l3 3' : 'M6 9.5v-7M3 6.5L6 9.5l3-3'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// The three time-based blocks that sit under the category donut on the general
// report: by-day bars, previous-period comparison, by-month bars.
export default function ReportTrends({ dailyData, monthlyData, current, previous, hasPrev, currencyCode }) {
  const { t } = useTranslation()

  const diff = current - previous
  const isUp = diff > 0
  const isFlat = diff === 0
  const pct = previous > 0 ? Math.abs((diff / previous) * 100) : 0
  // Growth draws attention (ochre/warning); a decline reads calm (sage/success).
  const tone = isFlat ? 'text-ink-muted' : isUp ? 'text-warning' : 'text-success'

  return (
    <div className="flex flex-col gap-8 mt-8">
      {/* 2 — Expenses by day of the selected period */}
      <section>
        <h2 className={sectionTitle}>{t('finance.report.by_days')}</h2>
        <Card className="p-4">
          {hasAny(dailyData) ? (
            <ReportBars data={dailyData} />
          ) : (
            <p className={emptyLine}>{t('finance.report.no_data')}</p>
          )}
        </Card>
      </section>

      {/* 3 — Comparison with the equivalent previous period */}
      <section>
        <h2 className={sectionTitle}>{t('finance.report.vs_previous')}</h2>
        <Card className="p-5">
          {!hasPrev ? (
            <p className="font-sans text-sm text-ink-muted text-center py-2">
              {t('finance.report.no_previous_data')}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-xs uppercase tracking-caps text-ink-muted">
                  {t('finance.report.current')}
                </span>
                <span className="font-serif italic text-lg text-ink tabular-nums">
                  {fmt(current)} {currencyCode}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-xs uppercase tracking-caps text-ink-muted">
                  {t('finance.report.previous_period')}
                </span>
                <span className="font-sans text-md text-ink-soft tabular-nums">
                  {fmt(previous)} {currencyCode}
                </span>
              </div>
              <div className="border-t border-line pt-3 flex items-center justify-between gap-3">
                <span className={`font-mono text-xs uppercase tracking-caps ${tone}`}>
                  {isFlat
                    ? t('finance.report.previous_period')
                    : isUp
                      ? t('finance.report.growth')
                      : t('finance.report.decline')}
                </span>
                <span className={`flex items-center gap-1.5 font-sans text-md tabular-nums ${tone}`}>
                  {!isFlat && <ArrowIcon up={isUp} />}
                  {isUp ? '+' : isFlat ? '' : '−'}
                  {fmt(Math.abs(diff))} {currencyCode}
                  {previous > 0 && <span className="opacity-70">· {pct.toFixed(0)}%</span>}
                </span>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* 4 — Last six calendar months */}
      <section>
        <h2 className={sectionTitle}>{t('finance.report.by_months')}</h2>
        <Card className="p-4">
          {hasAny(monthlyData) ? (
            <ReportBars data={monthlyData} />
          ) : (
            <p className={emptyLine}>{t('finance.report.no_data')}</p>
          )}
        </Card>
      </section>
    </div>
  )
}
