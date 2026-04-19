import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LocaleGate from './components/LocaleGate'
import WelcomePage from './pages/welcome/WelcomePage'
import LoginPage from './pages/auth/LoginPage'
import AuthCallback from './pages/auth/AuthCallback'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import DashboardPage from './pages/dashboard/DashboardPage'

export default function App() {
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
          path="/auth/callback"
          element={
            <LocaleGate>
              <AuthCallback />
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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
