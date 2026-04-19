import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import BottomNav from './components/layout/BottomNav'
import LoginPage from './pages/auth/LoginPage'
import OnboardingPage from './pages/auth/OnboardingPage'
import Dashboard from './pages/dashboard/Dashboard'

function AppShell() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

function Placeholder({ title }) {
  return (
    <div className="p-6 pb-24">
      <h1 className="text-xl text-gold">{title}</h1>
      <p className="mt-2 text-sm text-white/60">Будет реализовано позже.</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/finance" element={<Placeholder title="Финансы" />} />
            <Route path="/children" element={<Placeholder title="Дети" />} />
            <Route path="/health" element={<Placeholder title="Здоровье" />} />
            <Route path="/more" element={<Placeholder title="Ещё" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
