import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1))
      const errorDesc =
        params.get('error_description') || 'Ссылка недействительна или истекла'
      setStatus('error')
      setErrorMessage(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
    }
  }, [])

  useEffect(() => {
    if (status === 'error') return
    if (loading) return
    if (!user) return
    if (profile === null) return

    if (profile.onboarding_completed) {
      navigate('/', { replace: true })
    } else {
      navigate('/onboarding', { replace: true })
    }
  }, [user, profile, loading, status, navigate])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading' && !user) {
        setStatus('error')
        setErrorMessage('Не удалось войти. Попробуй ещё раз.')
      }
    }, 8000)
    return () => clearTimeout(timer)
  }, [user, status])

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-line border-t-accent rounded-full mx-auto mb-6"
            />
            <h2 className="font-serif italic text-2xl text-accent mb-2">
              Входим...
            </h2>
            <p className="font-sans text-ink-soft text-sm">
              Секундочку, готовлю твой кабинет
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="font-serif italic text-2xl text-accent mb-3">
              Что-то пошло не так
            </h2>
            <p className="font-sans text-ink-soft text-sm mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-accent text-accent-ink rounded-xl py-3 font-sans font-medium hover:opacity-90 transition"
            >
              На главную
            </button>
          </>
        )}
      </div>
    </div>
  )
}
