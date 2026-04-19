import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getStoredLocale } from '../lib/locales'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-ink-muted font-sans">Загрузка...</div>
      </div>
    )
  }

  if (!getStoredLocale()) return <Navigate to="/welcome" replace />

  if (!user) return <Navigate to="/login" replace />

  const onboardingDone = profile?.onboarding_completed === true
  const onOnboarding = location.pathname === '/onboarding'

  if (profile?.onboarding_completed === false && !onOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  if (onboardingDone && onOnboarding) {
    return <Navigate to="/" replace />
  }

  return children
}
