import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import WidgetHeader from '../../components/ui/WidgetHeader'
import { useWaterToday } from '../../hooks/useWaterToday'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

// A single glass: filled → accent, empty → muted card-alt with a soft border.
function Glass({ filled, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group active:scale-90 transition-transform"
    >
      <svg width="30" height="38" viewBox="0 0 30 38" fill="none">
        <path
          d="M4 3h22l-2.2 30.5A2.5 2.5 0 0 1 21.3 36H8.7a2.5 2.5 0 0 1-2.5-2.5L4 3Z"
          className={
            filled
              ? 'fill-accent stroke-accent'
              : 'fill-card-alt stroke-line-strong'
          }
          strokeWidth="1.5"
        />
      </svg>
    </button>
  )
}

// 7-day weekday initial from an ISO date, localized.
function weekdayInitial(iso, locale) {
  try {
    const d = new Date(iso + 'T00:00:00')
    return new Intl.DateTimeFormat(locale, { weekday: 'short' })
      .format(d)
      .slice(0, 2)
  } catch {
    return ''
  }
}

export default function WaterPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { cups, goal, weekly, loading, adding, goalSaved, add, removeCup, nudgeGoal } =
    useWaterToday()

  const todayIso = weekly.length ? weekly[weekly.length - 1].date : null

  const percent = goal > 0 ? Math.min(100, Math.round((cups / goal) * 100)) : 0
  const reached = cups >= goal && goal > 0

  const average = useMemo(() => {
    if (!weekly.length) return 0
    const sum = weekly.reduce((a, w) => a + w.glasses, 0)
    return Math.round((sum / weekly.length) * 10) / 10
  }, [weekly])

  // Streak: consecutive days (ending today) that reached the goal. An
  // in-progress today (below goal) doesn't break the streak — we skip it.
  const streak = useMemo(() => {
    if (!weekly.length || goal <= 0) return 0
    let count = 0
    for (let i = weekly.length - 1; i >= 0; i--) {
      const reachedDay = weekly[i].glasses >= goal
      if (reachedDay) {
        count += 1
      } else if (i === weekly.length - 1) {
        continue // today not done yet — don't count, don't break
      } else {
        break
      }
    }
    return count
  }, [weekly, goal])

  const weekMax = useMemo(
    () => Math.max(goal, ...weekly.map((w) => w.glasses), 1),
    [weekly, goal],
  )

  // Glass tap: fill the next empty one, or empty the last filled one.
  const onGlassTap = (index) => {
    if (index >= cups) add()
    else if (index === cups - 1) removeCup()
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-[430px] mx-auto px-gutter pt-8 pb-24"
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/health')}
            aria-label={t('common.back')}
            className="shrink-0 h-9 w-9 -ml-1 rounded-full flex items-center justify-center text-ink-soft hover:bg-card-alt transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M11 3.5 5.5 9l5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div>
            <h1 className="font-serif italic text-3xl leading-none text-ink">
              {t('water.title')}
            </h1>
          </div>
        </motion.div>

        {/* Counter + glasses */}
        <motion.section variants={fadeIn}>
          <Card className="p-5">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="font-serif text-[44px] leading-none">
                  <span className="text-accent">{loading ? '·' : cups}</span>
                  <span className="text-ink-muted"> / {goal}</span>
                </div>
                <div className="font-sans text-sm text-ink-soft mt-2">
                  {reached ? t('water.goal_reached') : `${percent}%`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={removeCup}
                  disabled={adding || cups <= 0}
                  aria-label={t('water.remove')}
                  className="h-11 w-11 rounded-full bg-card-alt text-ink border border-line flex items-center justify-center active:scale-95 transition disabled:opacity-40"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={add}
                  disabled={adding}
                  aria-label={t('water.add')}
                  className="h-11 w-11 rounded-full bg-accent text-accent-ink flex items-center justify-center shadow-card active:scale-95 transition disabled:opacity-60"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3v10M3 8h10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Row of glasses */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: goal }).map((_, i) => (
                <Glass
                  key={i}
                  filled={i < cups}
                  onClick={() => onGlassTap(i)}
                  label={
                    i < cups ? t('water.remove') : t('water.add')
                  }
                />
              ))}
            </div>
          </Card>
        </motion.section>

        {/* Goal control */}
        <motion.section variants={fadeIn} className="mt-6">
          <WidgetHeader className="mb-3">{t('water.goal')}</WidgetHeader>
          <Card className="p-5 flex items-center justify-between">
            <div className="min-w-0">
              <div className="font-sans text-md text-ink-soft">
                {t('water.goal_hint')}
              </div>
              {/* Мягкий фидбек: цель сохранена */}
              <motion.div
                initial={false}
                animate={{ opacity: goalSaved ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 mt-1 h-4 text-success"
                aria-live="polite"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7.5 6 11l5.5-7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-sans text-xs">{t('water.goal_saved')}</span>
              </motion.div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => nudgeGoal(-1)}
                disabled={goal <= 1}
                aria-label={t('water.goal_decrease')}
                className="h-9 w-9 rounded-full bg-card-alt text-ink border border-line flex items-center justify-center active:scale-95 transition disabled:opacity-40"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7h9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <span className="font-serif text-2xl w-8 text-center text-ink">
                {goal}
              </span>
              <button
                type="button"
                onClick={() => nudgeGoal(1)}
                disabled={goal >= 20}
                aria-label={t('water.goal_increase')}
                className="h-9 w-9 rounded-full bg-accent text-accent-ink flex items-center justify-center active:scale-95 transition disabled:opacity-40"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 2.5v9M2.5 7h9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </Card>
        </motion.section>

        {/* Weekly stats */}
        <motion.section variants={fadeIn} className="mt-6">
          <WidgetHeader className="mb-3">{t('water.weekly')}</WidgetHeader>
          <Card className="p-5">
            {loading && weekly.length === 0 ? (
              <div className="font-sans text-sm text-ink-muted text-center py-6">
                {t('common.loading')}
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between gap-2 h-28">
                  {weekly.map((w) => {
                    const isToday = w.date === todayIso
                    const h = Math.max(8, Math.round((w.glasses / weekMax) * 100))
                    const hit = w.glasses >= goal
                    return (
                      <div
                        key={w.date}
                        className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                      >
                        <span className="font-mono text-[10px] text-ink-muted">
                          {w.glasses}
                        </span>
                        <div className="w-full flex-1 flex items-end">
                          <div
                            className={`w-full rounded-md transition-all ${
                              hit
                                ? 'bg-accent'
                                : isToday
                                  ? 'bg-decor-rose-soft'
                                  : 'bg-card-alt border border-line'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono text-[10px] uppercase tracking-caps ${
                            isToday ? 'text-accent' : 'text-ink-muted'
                          }`}
                        >
                          {weekdayInitial(w.date, i18n.language)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                  <span className="font-sans text-sm text-ink-soft">
                    {t('water.average')}
                  </span>
                  <span className="font-sans text-md text-ink">
                    {average} {t('water.per_day')}
                  </span>
                </div>
              </>
            )}
          </Card>
        </motion.section>

        {/* Streak */}
        <motion.section variants={fadeIn} className="mt-6">
          <WidgetHeader className="mb-3">{t('water.streak')}</WidgetHeader>
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="font-serif italic text-2xl text-ink">
                {streak > 0
                  ? t('water.streak_days', { count: streak })
                  : t('water.streak_empty')}
              </div>
              <div className="font-sans text-sm text-ink-soft mt-1">
                {t('water.streak_hint')}
              </div>
            </div>
            <span
              className={`shrink-0 h-11 w-11 rounded-full flex items-center justify-center ${
                streak > 0 ? 'bg-accent text-accent-ink' : 'bg-card-alt text-ink-muted'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2.5c2.8 3 4.5 5.2 4.5 7.8a4.5 4.5 0 1 1-9 0c0-2.6 1.7-4.8 4.5-7.8Z"
                  className="fill-current"
                />
              </svg>
            </span>
          </Card>
        </motion.section>
      </motion.div>
    </div>
  )
}
