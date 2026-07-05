import { useTranslation } from 'react-i18next'
import { useDashboardConfig } from '../../hooks/useDashboardConfig'

// "Show on home" toggle for a module screen. Star fills (accent) when the
// module's widget is pinned to the dashboard. Reads/writes the enabled-widget
// list in profiles.dashboard_config via useDashboardConfig — instant feedback,
// optimistic + rollback handled by the hook.
export default function PinToggle({ widgetKey, className = '' }) {
  const { t } = useTranslation()
  const { isEnabled, toggle, saving } = useDashboardConfig()
  const on = isEnabled(widgetKey)

  return (
    <button
      type="button"
      onClick={() => toggle(widgetKey)}
      disabled={saving}
      aria-pressed={on}
      aria-label={on ? t('dashboard.unpin_from_home') : t('dashboard.pin_to_home')}
      title={on ? t('dashboard.unpin_from_home') : t('dashboard.pin_to_home')}
      className={`shrink-0 inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3 rounded-full border transition active:scale-95 disabled:opacity-60 ${
        on
          ? 'bg-accent/10 border-accent text-accent'
          : 'bg-card-alt border-line text-ink-muted hover:text-ink'
      } ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2.5l2.2 4.6 5 .7-3.6 3.5.9 5L10 13.9 5.5 16.3l.9-5L2.8 7.8l5-.7z"
          className={on ? 'fill-current' : 'fill-none'}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-mono text-[10px] uppercase tracking-caps">
        {on ? t('dashboard.unpin_from_home') : t('dashboard.pin_to_home')}
      </span>
    </button>
  )
}
