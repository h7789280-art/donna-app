import { useAuth } from '../../contexts/AuthContext'

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth()
  const displayName = profile?.name || user?.email

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6">
      <h1 className="font-serif italic text-3xl text-accent">Дашборд</h1>
      <p className="font-sans text-ink-soft mt-2">{displayName}</p>
      <button
        onClick={signOut}
        className="bg-accent text-accent-ink rounded-xl px-4 py-2 mt-6 font-sans"
      >
        Logout
      </button>
    </div>
  )
}
