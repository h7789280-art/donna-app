import { useTranslation } from 'react-i18next'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { getGroup } from './catalog'

// "More" tab — level 2: the modules inside one group.
// Every module is a coming-soon placeholder: greyed out (ink-muted), not
// clickable, with a small "Скоро" badge. When a module ships, flip its
// route/status in catalog.jsx and the live-row branch below takes over.
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function MoreGroupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { groupId } = useParams()
  const group = getGroup(groupId)

  // Unknown group id → bounce back to the catalog.
  if (!group) return <Navigate to="/more" replace />

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-24">
        <button
          type="button"
          onClick={() => navigate('/more')}
          className="inline-flex items-center gap-1.5 mb-4 -ml-1 font-mono text-xs uppercase tracking-caps text-ink-muted hover:text-ink transition-colors"
        >
          <BackIcon />
          {t('common.back')}
        </button>

        <h1 className="font-serif italic text-3xl text-ink mb-1">
          {t(`more.groups.${group.key}`)}
        </h1>
        <p className="font-sans text-md text-ink-soft mb-6">
          {t(`more.groups.${group.key}_sub`)}
        </p>

        <div className="flex flex-col gap-2.5">
          {group.modules.map(({ key, icon: Icon, status }) => (
            <Card
              key={key}
              as="div"
              aria-disabled={status === 'soon'}
              className="p-4 flex items-center gap-3 opacity-70 cursor-default"
            >
              <span className="shrink-0 h-10 w-10 rounded-xl bg-card-alt text-ink-muted flex items-center justify-center">
                <Icon />
              </span>
              <span className="min-w-0 flex-1 font-sans text-md text-ink-muted">
                {t(`more.modules.${key}`)}
              </span>
              <Badge variant="neutral" className="shrink-0">
                {t('coming_soon')}
              </Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
