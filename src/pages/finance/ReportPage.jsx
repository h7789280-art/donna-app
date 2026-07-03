import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWallets } from '../../hooks/useWallets'
import { useFinanceReport, NO_CATEGORY } from '../../hooks/useFinanceReport'
import { getCurrency } from '../../lib/currencies'
import { analyzeExpenses } from '../../lib/gemini'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ReportDonut, { colorFor } from '../../components/finance/ReportDonut'
import ReportRow from '../../components/finance/ReportRow'

// Local YYYY-MM-DD (user's timezone), so ranges line up with the date inputs.
function toISO(d) {
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}
function todayISO() {
  return toISO(new Date())
}
// Range for a named period. Week = last 7 days; Month = current calendar month.
function rangeFor(period) {
  const now = new Date()
  const today = todayISO()
  if (period === 'today') return { from: today, to: today }
  if (period === 'week') {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    return { from: toISO(start), to: today }
  }
  // month
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  return { from: toISO(first), to: today }
}

const PERIODS = ['today', 'week', 'month', 'custom']

const fieldLabel = 'font-mono text-xs uppercase tracking-caps text-ink-muted'
const inputBase =
  'rounded-xl bg-canvas border border-line px-3 py-2.5 font-sans text-md text-ink outline-none focus:border-accent transition-colors'

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ReportPage() {
  const { t, i18n } = useTranslation()
  const { wallets, loading: walletsLoading } = useWallets()

  const [currency, setCurrency] = useState('')
  const [period, setPeriod] = useState('month')
  const [customFrom, setCustomFrom] = useState(todayISO)
  const [customTo, setCustomTo] = useState(todayISO)
  const [drill, setDrill] = useState(null) // parentId under inspection, or null

  // Donna's AI take: idle → loading → success (insight) | error.
  const [donnaState, setDonnaState] = useState('idle')
  const [insight, setInsight] = useState('')

  // Distinct currencies actually present across the user's wallets.
  const currencies = useMemo(
    () => [...new Set(wallets.map((w) => w.currency))],
    [wallets]
  )

  // Default to the primary wallet's currency (or the first one) once loaded.
  useEffect(() => {
    if (walletsLoading || currencies.length === 0) return
    setCurrency((prev) => {
      if (prev && currencies.includes(prev)) return prev
      const def = wallets.find((w) => w.is_default) ?? wallets[0]
      return def?.currency ?? currencies[0]
    })
  }, [wallets, walletsLoading, currencies])

  const { from, to } = useMemo(() => {
    if (period === 'custom') return { from: customFrom, to: customTo }
    return rangeFor(period)
  }, [period, customFrom, customTo])

  const { total, parents, childrenOf, loading } = useFinanceReport({ currency, from, to })

  // Reset drill-down + Donna's take whenever the filters change (the data shifts).
  useEffect(() => {
    setDrill(null)
    setDonnaState('idle')
    setInsight('')
  }, [currency, from, to])

  // Human-readable label of the active period, for Gemini's context.
  const periodLabel = useMemo(() => {
    if (period === 'custom') return `${customFrom} — ${customTo}`
    return t(`finance.report.period_${period}`)
  }, [period, customFrom, customTo, t])

  const currencyCode = currency
  const parentName = (p) => (p?.name ?? t('finance.report.no_category'))

  // Colour every parent by its rank so donut segments and rows stay in sync.
  const parentSegments = useMemo(
    () =>
      parents.map((p, i) => ({
        ...p,
        color: colorFor(i),
        label: parentName(p),
      })),
    [parents] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const drillParent = drill != null ? parentSegments.find((p) => p.parentId === drill) : null
  const subRows = useMemo(() => {
    if (drill == null) return []
    return childrenOf(drill).map((s, i) => ({
      ...s,
      color: colorFor(i),
      label: s.subId == null ? t('finance.report.no_subcategory') : (s.name ?? t('finance.report.no_subcategory')),
    }))
  }, [drill, childrenOf, t])

  const showCurrencySwitcher = currencies.length > 1
  const isEmpty = !loading && total <= 0

  // Which set of segments/rows feeds the donut + list right now.
  const inDrill = Boolean(drillParent)
  const donutSegments = inDrill
    ? subRows.map((s) => ({ name: s.label, value: s.sum, color: s.color }))
    : parentSegments.map((p) => ({ name: p.label, value: p.sum, color: p.color }))
  const donutTotal = inDrill ? drillParent.sum : total

  // «Разбор от Донны»: сводка [{category, amount}] → Edge Function → Gemini.
  async function runDonnaAnalysis() {
    if (donnaState === 'loading') return
    setDonnaState('loading')
    try {
      const summary = parentSegments.map((p) => ({
        category: p.label,
        amount: Math.round(p.sum * 100) / 100,
      }))
      const text = await analyzeExpenses({
        summary,
        currency: currencyCode,
        periodLabel,
        language: i18n.language,
      })
      setInsight(text)
      setDonnaState('success')
    } catch (err) {
      console.error('[ReportPage] Donna analysis failed:', err)
      setDonnaState('error')
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-24">
        <h1 className="font-serif italic text-3xl text-ink mb-6">{t('finance.report.title')}</h1>

        {/* Currency switcher (hidden when the user has a single currency) */}
        {showCurrencySwitcher && (
          <div className="flex flex-col gap-1.5 mb-4">
            <span className={fieldLabel}>{t('finance.report.currency')}</span>
            <div className="flex flex-wrap gap-2">
              {currencies.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`rounded-lg border px-3 py-1.5 font-sans text-sm transition-colors cursor-pointer ${
                    currency === code
                      ? 'bg-accent text-accent-ink border-transparent'
                      : 'bg-card text-ink border-line hover:bg-card-alt'
                  }`}
                >
                  {getCurrency(code).symbol} {code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Period switcher */}
        <div className="flex flex-col gap-1.5 mb-4">
          <span className={fieldLabel}>{t('finance.report.period')}</span>
          <div className="grid grid-cols-4 gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-lg border px-2 py-2 font-sans text-sm transition-colors cursor-pointer ${
                  period === p
                    ? 'bg-accent text-accent-ink border-transparent'
                    : 'bg-card text-ink border-line hover:bg-card-alt'
                }`}
              >
                {t(`finance.report.period_${p}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom range inputs */}
        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>{t('finance.report.from')}</span>
              <input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
                className={inputBase}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>{t('finance.report.to')}</span>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                onChange={(e) => setCustomTo(e.target.value)}
                className={inputBase}
              />
            </label>
          </div>
        )}

        {loading && (
          <p className="font-mono text-xs uppercase tracking-caps text-ink-muted mt-6">
            {t('common.loading')}
          </p>
        )}

        {isEmpty && (
          <Card className="p-8 flex flex-col items-center text-center mt-2">
            <h2 className="font-serif italic text-xl text-ink mb-1">{t('finance.report.no_data')}</h2>
          </Card>
        )}

        {!loading && !isEmpty && (
          <>
            {/* Drill-down header */}
            {inDrill && (
              <button
                type="button"
                onClick={() => setDrill(null)}
                className="flex items-center gap-1.5 mb-2 font-sans text-md text-accent hover:opacity-80 transition-opacity cursor-pointer"
              >
                <BackIcon />
                <span>{t('finance.report.back')}</span>
              </button>
            )}
            {inDrill && (
              <h2 className="font-serif italic text-xl text-ink mb-3">{parentName(drillParent)}</h2>
            )}

            <ReportDonut segments={donutSegments} total={donutTotal} currencyCode={currencyCode} />

            <Card className="px-4 py-1 divide-y divide-line mt-4">
              {!inDrill &&
                parentSegments.map((p) => (
                  <ReportRow
                    key={p.parentId}
                    color={p.color}
                    name={p.label}
                    sum={p.sum}
                    share={p.share}
                    currencyCode={currencyCode}
                    onClick={() => setDrill(p.parentId)}
                  />
                ))}
              {inDrill &&
                subRows.map((s) => (
                  <ReportRow
                    key={s.subId ?? '__nosub__'}
                    color={s.color}
                    name={s.label}
                    sum={s.sum}
                    share={s.share}
                    currencyCode={currencyCode}
                  />
                ))}
            </Card>

            {/* Donna's AI take — general report only (not drill-down) */}
            {!inDrill && (
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={runDonnaAnalysis}
                  disabled={donnaState === 'loading'}
                  className="w-full"
                >
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 1.5l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="currentColor" opacity="0.7" />
                  </svg>
                  {donnaState === 'loading'
                    ? t('finance.report.donna_thinking')
                    : t('finance.report.donna_button')}
                </Button>

                {donnaState === 'error' && (
                  <p className="font-sans text-sm text-ink-muted text-center">
                    {t('finance.report.donna_error')}
                  </p>
                )}

                {donnaState === 'success' && (
                  <Card className="p-5 bg-card-alt">
                    <p className="font-serif italic text-md text-ink-soft leading-relaxed whitespace-pre-line break-words">
                      {insight}
                    </p>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
