import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Card from '../components/ui/Card'
import WidgetHeader from '../components/ui/WidgetHeader'
import HabitIcon from '../components/habits/HabitIcon'
import { useHabits, DEFAULT_COLOR } from '../hooks/useHabits'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const ROUTE = '/health/habits'

// Static Tailwind classes per token key (dynamic names would be purged).
// Mirrors the maps in HabitsPage so the widget reads in the habit's colour.
const COLOR_BG = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  'decor-rose': 'bg-decor-rose',
  'decor-taupe': 'bg-decor-taupe',
}
const bgFor = (key) => COLOR_BG[key] || COLOR_BG[DEFAULT_COLOR]

const COLOR_TEXT = {
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  'decor-rose': 'text-decor-rose',
  'decor-taupe': 'text-decor-taupe',
}
const textFor = (key) => COLOR_TEXT[key] || COLOR_TEXT[DEFAULT_COLOR]

// Compact check circle — filled with the habit colour + knockout check when
// done, outlined otherwise.
function MiniCheck({ done, color, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={done}
      className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition ${
        done ? `${bgFor(color)} text-canvas` : 'bg-card-alt border-2 border-line text-transparent'
      }`}
    >
      <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
        <path
          d="M4 9.5 7.5 13 14 5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

// Compact, working habits widget. Reuses useHabits — same list + toggleToday
// as the Habits module (no duplication). Tap the header → open the module;
// tap a circle → mark today's habit done right from home.
export default function HabitsWidget() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { habits, loading, toggleToday } = useHabits()

  const open = () => navigate(ROUTE)

  return (
    <motion.section variants={fadeIn}>
      <button
        type="button"
        onClick={open}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <WidgetHeader className="group-hover:text-accent transition-colors">
          {t('dashboard.widgets.habits')}
        </WidgetHeader>
        <svg
          width="14"
          height="14"
          viewBox="0 0 18 18"
          fill="none"
          className="text-ink-muted group-hover:text-accent transition-colors"
          aria-hidden="true"
        >
          <path
            d="M7 3.5 12.5 9 7 14.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Card className="p-4">
        {loading && habits.length === 0 ? (
          <div className="font-sans text-sm text-ink-muted text-center py-3">
            {t('common.loading')}
          </div>
        ) : habits.length === 0 ? (
          <button
            type="button"
            onClick={open}
            className="w-full font-sans text-sm text-ink-muted text-center py-3 hover:text-accent transition-colors"
          >
            {t('dashboard.widgets.habits_empty')}
          </button>
        ) : (
          <div className="space-y-2.5">
            {habits.map((h) => (
              <div key={h.id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={open}
                  className="min-w-0 flex-1 flex items-center gap-3 text-left"
                >
                  <span className="shrink-0 h-9 w-9 rounded-xl bg-card-alt flex items-center justify-center">
                    <HabitIcon icon={h.icon} size={18} className={textFor(h.color)} />
                  </span>
                  <span className="min-w-0 font-sans text-md text-ink truncate">
                    {h.title}
                  </span>
                </button>
                <MiniCheck
                  done={h.todayDone}
                  color={h.color}
                  onClick={() => toggleToday(h.id)}
                  label={h.todayDone ? t('habits.mark_undone') : t('habits.mark_done')}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.section>
  )
}
