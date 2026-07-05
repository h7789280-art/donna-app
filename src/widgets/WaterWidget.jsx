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

// Compact, working water widget for the dashboard. Reuses useWaterToday —
// same counter/goal/+1 logic as the Water module (no duplication). Tap the
// body → open the full module; +1 acts right from home.
export default function WaterWidget() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cups, goal, adding, add } = useWaterToday()

  const open = () => navigate(ROUTE)

  return (
    <motion.section variants={fadeIn}>
      <WidgetHeader className="mb-3">{t('dashboard.widgets.water')}</WidgetHeader>
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
        className="p-5 flex items-center justify-between hover:bg-card-alt transition-colors cursor-pointer"
      >
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
          onClick={(e) => {
            e.stopPropagation()
            add()
          }}
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
  )
}
