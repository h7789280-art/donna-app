import { Navigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFinancePin } from '../../hooks/useFinancePin'

// Routing gate for the finance section:
//   loading                -> spinner
//   no PIN set              -> /finance/pin-setup
//   PIN set but locked      -> /finance/pin-enter
//   unlocked                -> render child routes (Outlet)
export default function FinanceGate() {
  const { t } = useTranslation()
  const { loading, isPinSet, isUnlocked } = useFinancePin()

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-caps text-ink-muted">
          {t('common.loading')}
        </p>
      </div>
    )
  }

  if (!isPinSet) return <Navigate to="/finance/pin-setup" replace />
  if (!isUnlocked) return <Navigate to="/finance/pin-enter" replace />

  return <Outlet />
}
