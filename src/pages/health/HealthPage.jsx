import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'

// Health hub. Water is the first live module; the rest are placeholders.
const COMING_SOON = ['vitamins', 'energy', 'sleep', 'cycle', 'mood']

function WaterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 2.5c3.5 3.8 5.6 6.6 5.6 9.7A5.6 5.6 0 1 1 5.4 12.2c0-3.1 2.1-5.9 5.6-9.7Z"
        className="fill-current"
      />
    </svg>
  )
}

export default function HealthPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-24">
        <h1 className="font-serif italic text-3xl text-ink mb-1">
          {t('nav.health')}
        </h1>
        <p className="font-sans text-md text-ink-soft mb-6">
          {t('health.subtitle')}
        </p>

        {/* Live module: Water */}
        <Link to="/health/water" className="block mb-3">
          <Card className="p-4 flex items-center gap-4 hover:bg-card-alt transition-colors cursor-pointer">
            <span className="shrink-0 h-11 w-11 rounded-xl bg-accent text-accent-ink flex items-center justify-center">
              <WaterIcon />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-md font-medium text-ink">
                {t('water.title')}
              </h2>
              <p className="font-sans text-sm text-ink-soft mt-0.5">
                {t('water.card_subtitle')}
              </p>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-ink-muted shrink-0"
            >
              <path
                d="M6 3.5 10.5 8 6 12.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Card>
        </Link>

        {/* Coming soon */}
        <div className="grid grid-cols-2 gap-3">
          {COMING_SOON.map((key) => (
            <Card key={key} className="p-4 opacity-60">
              <h2 className="font-sans text-md font-medium text-ink">
                {t(`health.modules.${key}`)}
              </h2>
              <p className="font-mono text-xs uppercase tracking-caps text-accent mt-1">
                {t('coming_soon')}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
