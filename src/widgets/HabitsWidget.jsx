import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Card from '../components/ui/Card'
import WidgetHeader from '../components/ui/WidgetHeader'
import ProgressRing from '../components/ui/ProgressRing'
import { useHabits } from '../hooks/useHabits'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const ROUTE = '/health/habits'

// Compact habits widget — a short, wide dashboard tile (h-28) showing today's
// SUMMARY (N / M done). A full check-off list won't fit a tile, so ticking
// happens in the module: tap the tile → open /health/habits. Reuses useHabits
// (same list + todayDone as the module, no duplication). No habits → prompt.
export default function HabitsWidget() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { habits, loading } = useHabits()

  const open = () => navigate(ROUTE)

  const { done, total, pct } = useMemo(() => {
    const total = habits.length
    const done = habits.filter((h) => h.todayDone).length
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [habits])

  const isEmpty = !loading && total === 0

  return (
    <motion.section variants={fadeIn} className="h-28">
      <Card
        onClick={open}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            open()
          }
        }}
        className="h-full p-3.5 flex flex-col justify-between hover:bg-card-alt transition-colors cursor-pointer"
      >
        {/* Top: label + target glyph */}
        <div className="flex items-start justify-between">
          <WidgetHeader>{t('dashboard.widgets.habits')}</WidgetHeader>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-accent shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        {isEmpty ? (
          /* Empty state — tap opens the module to create habits. */
          <p className="font-sans text-sm text-ink-muted">
            {t('dashboard.widgets.habits_empty')}
          </p>
        ) : (
          /* Summary: N / M done today + a small progress ring. */
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="font-serif leading-none">
                <span className="text-accent text-3xl">{done}</span>
                <span className="text-ink-muted text-xl"> / {total}</span>
              </div>
              <div className="font-sans text-[11px] text-ink-muted mt-1 truncate">
                {t('dashboard.widgets.habits_summary')}
              </div>
            </div>
            <ProgressRing value={pct} size={44} strokeWidth={5} className="shrink-0" />
          </div>
        )}
      </Card>
    </motion.section>
  )
}
