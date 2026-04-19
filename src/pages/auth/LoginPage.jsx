import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const { user, signInWithOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Введи корректный email')
      return
    }
    setLoading(true)
    setError(null)
    const { error: otpError } = await signInWithOtp(email)
    if (otpError) {
      setError(otpError.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full">
        {!sent ? (
          <>
            <div className="text-center mb-8">
              <h1 className="font-serif italic text-4xl text-accent">Donna</h1>
              <p className="font-sans text-ink-soft text-sm mt-2">
                AI-менеджер твоей жизни
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-sans text-xs text-ink-muted mb-2 tracking-label uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-canvas-soft border border-line rounded-xl text-ink font-sans placeholder:text-ink-muted focus:border-accent focus:outline-none transition"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-700 font-sans">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-accent text-accent-ink rounded-xl py-3 font-sans font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Отправляем...' : 'Получить ссылку'}
              </button>
            </form>

            <p className="text-center text-xs text-ink-muted font-sans mt-6">
              Без паролей. Просто проверь почту.
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="font-serif italic text-3xl text-accent mb-3">
              Проверь почту
            </h2>
            <p className="font-sans text-ink-soft">
              Ссылка для входа отправлена на
              <br />
              <span className="text-ink font-medium">{email}</span>
            </p>
            <button
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
              className="mt-6 text-sm text-ink-muted font-sans underline hover:text-ink"
            >
              Ввести другой email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
