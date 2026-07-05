import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Icons follow the project's inline-SVG convention (24×24 viewBox,
// stroke="currentColor", strokeWidth 1.5, rounded caps) — same set/style as
// the finance hub glyphs. currentColor lets each tab inherit accent/muted.
function HomeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FinanceIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 12.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16.5" cy="12.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

function PlannerIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.5 13h3M8.5 16.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function HealthIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s-7-4.35-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.65 12 20 12 20z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.5 12.5H9l1.5-3 2 5 1.5-2h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" />
    </svg>
  )
}

const tabs = [
  { to: '/', key: 'home', Icon: HomeIcon },
  { to: '/finance', key: 'finance', Icon: FinanceIcon },
  { to: '/planner', key: 'planner', Icon: PlannerIcon },
  { to: '/health', key: 'health', Icon: HealthIcon },
  { to: '/more', key: 'more', Icon: MoreIcon },
]

export default function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 border-t border-line bg-card pb-[calc(env(safe-area-inset-bottom)+20px)]">
      {tabs.map(({ to, key, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-1.5 py-3.5 transition-colors ${
              isActive ? 'text-accent' : 'text-ink-muted'
            }`
          }
        >
          <Icon />
          <span className="font-mono uppercase tracking-caps text-[11px] leading-none">
            {t(`nav.${key}`)}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
