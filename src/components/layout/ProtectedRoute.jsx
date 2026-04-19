import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gold">
        Загрузка…
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return children
}
