import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/ui/Card'
import WidgetHeader from '../../components/ui/WidgetHeader'
import ChildCard from '../../components/ui/ChildCard'
import { useChildren } from '../../hooks/useChildren'
import { useWaterToday } from '../../hooks/useWaterToday'
import { useDailyQuote } from '../../hooks/useDailyQuote'

function getTimeOfDay(timezone) {
  const now = new Date()
  let hour = now.getHours()
  if (timezone) {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        hour12: false,
        timeZone: timezone,
      }).formatToParts(now)
      const h = parts.find((p) => p.type === 'hour')
      if (h) hour = parseInt(h.value, 10)
    } catch {
      /* fall back to local hour */
    }
  }
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'day'
  if (hour >= 18 && hour < 23) return 'evening'
  return 'night'
}

function formatDateUppercase(locale) {
  const now = new Date()
  try {
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now)
    const day = new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(now)
    const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(now)
    return `${weekday} · ${day} ${month}`.toUpperCase()
  } catch {
    return now.toDateString().toUpperCase()
  }
}

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth()
  const { t, i18n } = useTranslation()

  const displayName = profile?.name || (user?.email ? user.email.split('@')[0] : '')
  const initial = (displayName || '?').slice(0, 1).toUpperCase()

  const timeOfDay = useMemo(() => getTimeOfDay(profile?.timezone), [profile?.timezone])
  const dateLabel = useMemo(() => formatDateUppercase(i18n.language), [i18n.language])

  const { children } = useChildren(user?.id)
  const { cups, goal, adding, add } = useWaterToday(user?.id)
  const { quote } = useDailyQuote(user?.id)

  const greetingRaw = t(`dashboard.greeting_${timeOfDay}_sassy`, { name: displayName })
  const [greetLead, greetHighlight] = greetingRaw.includes('|')
    ? greetingRaw.split('|')
    : [greetingRaw, '']

  const quoteText = quote?.text || t('dashboard.default_quote')
  const quoteAuthor = quote?.author

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-6 pb-10">
        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-accent font-serif italic text-lg shrink-0"
            style={{
              background:
                'linear-gradient(145deg, var(--decor-rose-soft), var(--decor-taupe))',
            }}
            aria-hidden="true"
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs uppercase tracking-label text-ink-muted">
              {dateLabel}
            </div>
            <div className="font-sans text-sm text-ink-soft truncate">
              {t('dashboard.welcome_back', { name: displayName })}
            </div>
          </div>
          <button
            type="button"
            aria-label={t('dashboard.notifications_aria')}
            className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-ink-soft hover:text-accent hover:border-accent transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2.25c-2.48 0-4.5 2.02-4.5 4.5v2.45c0 .62-.22 1.22-.62 1.69L2.7 12.3a.75.75 0 00.57 1.23h11.46a.75.75 0 00.57-1.23l-1.18-1.41a2.63 2.63 0 01-.62-1.69V6.75c0-2.48-2.02-4.5-4.5-4.5zM7.5 15a1.5 1.5 0 003 0"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </header>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-section"
        >
          {/* Widget 1: Donna greeting */}
          <motion.section variants={fadeIn} className="relative overflow-hidden">
            <div
              className="absolute -top-16 -right-10 w-60 h-60 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(closest-side, var(--decor-rose-soft) 0%, transparent 70%)',
                opacity: 0.9,
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="font-mono text-xs uppercase tracking-caps text-ink-muted mb-3">
                DONNA
              </div>
              <h1 className="font-serif italic text-2xl text-ink leading-tight">
                {greetLead}
                {greetHighlight && (
                  <>
                    {' '}
                    <span className="text-accent">{greetHighlight.trim()}</span>
                  </>
                )}
              </h1>
              <p className="font-sans text-base text-ink-soft mt-3">
                {t('dashboard.subtitle_sassy', { count: children.length })}
              </p>
            </div>
          </motion.section>

          {/* Widget 2: Children */}
          {children.length > 0 && (
            <motion.section variants={fadeIn}>
              <WidgetHeader className="mb-3">
                {t('dashboard.family_label', { count: children.length })}
              </WidgetHeader>
              <div className="flex gap-3 overflow-x-auto -mx-gutter px-gutter pb-1 snap-x">
                {children.map((child) => (
                  <div key={child.id} className="snap-start shrink-0">
                    <ChildCard child={child} />
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Widget 3: Water */}
          <motion.section variants={fadeIn}>
            <WidgetHeader className="mb-3">{t('dashboard.water_label')}</WidgetHeader>
            <Card className="p-5 flex items-center justify-between">
              <div>
                <div className="font-serif text-2xl leading-none">
                  <span className="text-accent">{cups}</span>
                  <span className="text-ink-muted"> / {goal}</span>
                </div>
                <div className="font-sans text-xs text-ink-muted mt-1.5">
                  {t('dashboard.water_subtitle')}
                </div>
              </div>
              <button
                type="button"
                onClick={add}
                disabled={adding}
                aria-label={t('dashboard.water_add_aria')}
                className="w-12 h-12 rounded-full bg-accent text-accent-ink flex items-center justify-center shadow-card hover:opacity-90 active:scale-95 transition disabled:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 3.5v11M3.5 9h11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </Card>
          </motion.section>

          {/* Widget 4: Quote */}
          <motion.section variants={fadeIn}>
            <WidgetHeader className="mb-3">{t('dashboard.quote_label')}</WidgetHeader>
            <Card className="p-5">
              <p className="font-serif italic text-lg text-ink leading-snug">
                “{quoteText}”
              </p>
              {quoteAuthor && (
                <p className="font-sans text-xs text-ink-muted mt-3">— {quoteAuthor}</p>
              )}
            </Card>
          </motion.section>

          {/* Widget 5: Donna speaks */}
          <motion.section variants={fadeIn}>
            <WidgetHeader className="mb-3 flex items-center gap-1.5">
              <span>{t('dashboard.donna_speaks_label')}</span>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M6 1.5l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"
                  fill="currentColor"
                  opacity="0.7"
                />
              </svg>
            </WidgetHeader>
            <Card className="p-5 bg-card-alt">
              <p className="font-serif italic text-md text-ink-soft leading-relaxed">
                {t('dashboard.donna_insight_placeholder_sassy')}
              </p>
            </Card>
          </motion.section>
        </motion.div>

        {/* Logout — ghost button at bottom */}
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={signOut}
            className="font-sans text-xs text-ink-muted hover:text-accent transition-colors px-3 py-2"
          >
            {t('dashboard.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
