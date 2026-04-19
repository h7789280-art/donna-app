import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Главная', icon: '🏠' },
  { to: '/finance', label: 'Финансы', icon: '💰' },
  { to: '/children', label: 'Дети', icon: '👧' },
  { to: '/health', label: 'Здоровье', icon: '🌿' },
  { to: '/more', label: 'Ещё', icon: '☰' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-card">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
              isActive ? 'text-gold' : 'text-white/50'
            }`
          }
        >
          <span className="text-xl">{t.icon}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
