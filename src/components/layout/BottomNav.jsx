import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const tabs = [
  { to: '/', key: 'home' },
  { to: '/finance', key: 'finance' },
  { to: '/children', key: 'children' },
  { to: '/health', key: 'health' },
  { to: '/more', key: 'more' },
]

export default function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 border-t border-line bg-card">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center py-3 text-xs transition-colors ${
              isActive ? 'text-accent' : 'text-ink-muted'
            }`
          }
        >
          <span className="font-mono uppercase tracking-caps text-[10px]">
            {t(`nav.${tab.key}`)}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
