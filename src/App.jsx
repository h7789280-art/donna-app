import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LocaleGate from './components/LocaleGate'
import WelcomePage from './pages/welcome/WelcomePage'
import LoginPage from './pages/auth/LoginPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import FinancePage from './pages/finance/FinancePage'
import ChildrenPage from './pages/children/ChildrenPage'
import HealthPage from './pages/health/HealthPage'
import MorePage from './pages/more/MorePage'

export default function App() {
  useEffect(() => {
    console.log('[Donna] build:', import.meta.env.VITE_BUILD_TIME || 'dev')
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route
          path="/login"
          element={
            <LocaleGate>
              <LoginPage />
            </LocaleGate>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/children" element={<ChildrenPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/more" element={<MorePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
