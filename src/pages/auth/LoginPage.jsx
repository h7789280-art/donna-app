import { useState, useRef, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const { user, signInWithOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()

  const [stage, setStage] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resentAt, setResentAt] = useState(0)
  const codeInputRef = useRef(null)

  useEffect(() => {
    if (stage === 'code' && codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }, [stage])

  if (user) return <Navigate to="/" replace />

  const sendCode = async (targetEmail) => {
    const { error: otpError } = await signInWithOtp(targetEmail)
    if (otpError) throw otpError
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email || !email.includes('@')) {
      setError('Введи корректный email')
      return
    }
    setLoading(true)
    try {
      await sendCode(email)
      setStage('code')
    } catch (err) {
      setError(err?.message || 'Не удалось отправить код')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const clean = code.replace(/\D/g, '')
    if (clean.length !== 6) {
      setError('Введи 6 цифр из письма')
      return
    }
    setLoading(true)
    try {
      const { data, error: verifyErr } = await verifyOtp(email, clean)
      if (verifyErr) throw verifyErr
      const authedUser = data?.user
      if (!authedUser) throw new Error('Не удалось получить сессию')

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', authedUser.id)
        .maybeSingle()
      if (profileErr) throw profileErr

      if (profile?.onboarding_completed) {
        navigate('/', { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    } catch (err) {
      const msg = err?.message || ''
      if (/expired|invalid/i.test(msg)) {
        setError('Код неверный или устарел. Попробуй ещё раз или запроси новый.')
      } else {
        setError(msg || 'Не удалось войти')
      }
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      await sendCode(email)
      setResentAt(Date.now())
      setCode('')
      codeInputRef.current?.focus()
    } catch (err) {
      setError(err?.message || 'Не удалось отправить код')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeEmail = () => {
    setStage('email')
    setCode('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full">
        {stage === 'email' ? (
          <>
            <div className="text-center mb-8">
              <h1 className="font-serif italic text-4xl text-accent">Donna</h1>
              <p className="font-sans text-ink-soft text-sm mt-2">
                AI-менеджер твоей жизни
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                  autoComplete="email"
                  inputMode="email"
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
                {loading ? 'Отправляем...' : 'Получить код'}
              </button>
            </form>

            <p className="text-center text-xs text-ink-muted font-sans mt-6">
              Без паролей. Код придёт на почту.
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="font-serif italic text-3xl text-accent mb-2">
                Проверь почту
              </h2>
              <p className="font-sans text-ink-soft text-sm">
                Мы отправили 6-значный код на
                <br />
                <span className="text-ink font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block font-sans text-xs text-ink-muted mb-2 tracking-label uppercase text-center">
                  Код из письма
                </label>
                <input
                  ref={codeInputRef}
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setCode(digits)
                    if (error) setError(null)
                  }}
                  placeholder="— — — — — —"
                  disabled={loading}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className={`w-full px-4 py-4 bg-canvas-soft border rounded-xl text-ink font-serif text-3xl text-center placeholder:text-ink-muted/40 focus:outline-none transition ${
                    error ? 'border-red-700 focus:border-red-700' : 'border-line focus:border-accent'
                  }`}
                  style={{ letterSpacing: '0.5em' }}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-700 font-sans text-center">
                  {error}
                </div>
              )}

              {!error && resentAt > 0 && (
                <div className="text-sm text-ink-soft font-sans text-center">
                  Код отправлен повторно
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-accent text-accent-ink rounded-xl py-3 font-sans font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Проверяем...' : 'Войти'}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3 text-sm font-sans">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-ink-muted underline hover:text-ink disabled:opacity-50"
              >
                Отправить код ещё раз
              </button>
              <button
                type="button"
                onClick={handleChangeEmail}
                disabled={loading}
                className="text-ink-muted underline hover:text-ink disabled:opacity-50"
              >
                Ввести другой email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
