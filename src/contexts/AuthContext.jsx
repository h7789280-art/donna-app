import { createContext, useContext, useEffect, useState } from 'react'
import i18n from 'i18next'
import { supabase } from '../lib/supabase'
import {
  LOCALE_CODES,
  getStoredLocale,
  setStoredLocale,
} from '../lib/locales'

const AuthContext = createContext(null)

function isValidLocale(code) {
  return typeof code === 'string' && LOCALE_CODES.includes(code)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setProfile(null)
      return
    }
    let cancelled = false
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Failed to load profile:', error)
          setProfile(null)
          return
        }
        setProfile(data)

        const localLocale = getStoredLocale()
        const profileLocale = isValidLocale(data?.language) ? data.language : null

        if (profileLocale) {
          if (localLocale !== profileLocale) {
            setStoredLocale(profileLocale)
            i18n.changeLanguage(profileLocale)
          }
        } else if (isValidLocale(localLocale)) {
          supabase
            .from('profiles')
            .update({ language: localLocale })
            .eq('user_id', user.id)
            .then(({ error: upErr }) => {
              if (upErr) console.error('Failed to sync profile language:', upErr)
            })
        }
      })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const signInWithOtp = (email) =>
    supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

  const verifyOtp = (email, token) =>
    supabase.auth.verifyOtp({ email, token, type: 'email' })

  const signOut = () => supabase.auth.signOut()

  const refreshProfile = async () => {
    if (!user?.id) return { data: null, error: null }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  const value = {
    session,
    user,
    profile,
    loading,
    signInWithOtp,
    verifyOtp,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
