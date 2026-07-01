import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const tabs = [
  { to: '/', key: 'home', icon: '🏠' },
  { to: '/finance', key: 'finance', icon: '💰' },
  { to: '/children', key: 'children', icon: '👧' },
  { to: '/health', key: 'health', icon: '🌿' },
  { to: '/more', key: 'more', icon: '☰' },
]

export default function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-line bg-card">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
              isActive ? 'text-accent' : 'text-ink-muted'
            }`
          }
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="font-mono uppercase tracking-caps text-[10px]">
            {t(`nav.${tab.key}`)}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
