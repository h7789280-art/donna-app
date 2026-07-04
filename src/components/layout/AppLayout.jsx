import { Outlet } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
import BottomNav from './BottomNav'

// Shell for protected module screens: renders the routed page + persistent
// bottom navigation. Auth / locale / onboarding gating is delegated to
// ProtectedRoute. Bottom padding keeps content clear of the fixed BottomNav.
export default function AppLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-canvas pb-[calc(120px+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <BottomNav />
    </ProtectedRoute>
  )
}
