import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        console.log('[AuthCallback] start, url =', window.location.href)

        const hash = window.location.hash
        if (hash.includes('error=')) {
          const params = new URLSearchParams(hash.substring(1))
          const errorDesc =
            params.get('error_description') || 'Ссылка недействительна или истекла'
          console.warn('[AuthCallback] hash error:', errorDesc)
          if (!cancelled) {
            setStatus('error')
            setErrorMessage(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
          }
          return
        }

        console.log('[AuthCallback] waiting for session...')
        let session = null
        for (let i = 0; i < 20; i++) {
          const { data, error } = await supabase.auth.getSession()
          if (error) throw error
          if (data.session) {
            session = data.session
            break
          }
          await new Promise((r) => setTimeout(r, 150))
        }

        if (!session) {
          console.error('[AuthCallback] no session after wait')
          throw new Error('Сессия не получена. Попробуй ещё раз.')
        }

        const user = session.user
        console.log('[AuthCallback] session ok, user.id =', user.id)

        console.log('[AuthCallback] fetching profile...')
        const { data: profile, error: fetchErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (fetchErr) {
          console.error('[AuthCallback] profile fetch error:', fetchErr)
          throw fetchErr
        }

        if (!profile) {
          console.log('[AuthCallback] profile not found, inserting...')
          const { error: insertErr } = await supabase.from('profiles').insert({
            user_id: user.id,
            email: user.email,
            onboarding_completed: false,
          })
          if (insertErr) {
            console.error('[AuthCallback] profile insert error:', insertErr)
            throw insertErr
          }
          console.log('[AuthCallback] profile inserted, → /onboarding')
          if (!cancelled) navigate('/onboarding', { replace: true })
          return
        }

        console.log(
          '[AuthCallback] profile found, onboarding_completed =',
          profile.onboarding_completed
        )

        if (profile.onboarding_completed) {
          console.log('[AuthCallback] → /')
          if (!cancelled) navigate('/', { replace: true })
        } else {
          console.log('[AuthCallback] → /onboarding')
          if (!cancelled) navigate('/onboarding', { replace: true })
        }
      } catch (err) {
        console.error('[AuthCallback] fatal error:', err)
        if (cancelled) return
        setStatus('error')
        setErrorMessage(err?.message || 'Не удалось войти. Попробуй ещё раз.')
        setTimeout(() => {
          if (!cancelled) navigate('/login', { replace: true })
        }, 2500)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [navigate])

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
