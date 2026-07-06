import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Card from '../components/ui/Card'
import WidgetHeader from '../components/ui/WidgetHeader'
import { useWaterToday } from '../hooks/useWaterToday'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const ROUTE = '/health/water'

// Compact, working water widget — a short, wide dashboard tile (h-28).
// Reuses useWaterToday (same counter/goal/+1 logic as the Water module, no
// duplication). Tap the body → open the full module; +1 acts right from home.
export default function WaterWidget() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cups, goal, adding, add } = useWaterToday()

  const open = () => navigate(ROUTE)

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
        {/* Top: label + water drop glyph */}
        <div className="flex items-start justify-between">
          <WidgetHeader>{t('dashboard.widgets.water')}</WidgetHeader>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-accent shrink-0"
            aria-hidden="true"
          >
            <path
              d="M12 3.5s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Bottom: counter (left) + working +1 button (right) */}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="font-serif leading-none">
              <span className="text-accent text-3xl">{cups}</span>
              <span className="text-ink-muted text-xl"> / {goal}</span>
            </div>
            <div className="font-sans text-[11px] text-ink-muted mt-1 truncate">
              {t('dashboard.water_subtitle')}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              add()
            }}
            disabled={adding}
            aria-label={t('dashboard.water_add_aria')}
            className="w-10 h-10 shrink-0 rounded-full bg-accent text-accent-ink flex items-center justify-center shadow-card hover:opacity-90 active:scale-95 transition disabled:opacity-60"
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
        </div>
      </Card>
    </motion.section>
  )
}
