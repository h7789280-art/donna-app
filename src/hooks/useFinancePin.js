import { useCallback, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Lightweight local lock for the finance tab (privacy convenience) — NOT real
// auth. Actual data protection is Supabase session + RLS. Hence a plain
// SHA-256 via Web Crypto is enough; the user_id acts as the salt, so no
// separate salt column is needed and hashes don't collide across accounts.
async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Unlock flag is scoped per account so two users on the same browser session
// don't share an unlocked state.
function unlockKey(userId) {
  return `finance_unlocked_${userId}`
}

export function useFinancePin() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const userId = user?.id

  const isPinSet = Boolean(profile?.finance_pin_hash)

  // Bump this to re-read sessionStorage after (un)locking so consumers re-render.
  const [unlockTick, setUnlockTick] = useState(0)
  const isUnlocked = useMemo(() => {
    if (!userId) return false
    return sessionStorage.getItem(unlockKey(userId)) === 'true'
    // unlockTick is intentionally a re-read trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, unlockTick])

  // Wait for both auth and the profile row (which carries finance_pin_hash)
  // before letting the gate decide where to redirect.
  const loading = authLoading || (Boolean(userId) && !profile)

  const setUnlocked = useCallback(
    (value) => {
      if (!userId) return
      if (value) sessionStorage.setItem(unlockKey(userId), 'true')
      else sessionStorage.removeItem(unlockKey(userId))
      setUnlockTick((t) => t + 1)
    },
    [userId]
  )

  const setPin = useCallback(
    async (pin) => {
      if (!userId) return { ok: false, error: 'no-user' }
      const hash = await sha256Hex(pin + userId)
      const { data, error } = await supabase
        .from('profiles')
        .update({ finance_pin_hash: hash })
        .eq('user_id', userId)
        .select()
      if (error) {
        console.error('[useFinancePin] setPin error:', error)
        return { ok: false, error }
      }
      console.log('[useFinancePin] PIN saved:', { rows: data?.length })
      setUnlocked(true)
      await refreshProfile()
      return { ok: true, error: null }
    },
    [userId, refreshProfile, setUnlocked]
  )

  const verifyPin = useCallback(
    async (pin) => {
      if (!userId || !profile?.finance_pin_hash) return false
      const hash = await sha256Hex(pin + userId)
      if (hash === profile.finance_pin_hash) {
        setUnlocked(true)
        return true
      }
      return false
    },
    [userId, profile?.finance_pin_hash, setUnlocked]
  )

  const lock = useCallback(() => setUnlocked(false), [setUnlocked])

  return { loading, isPinSet, isUnlocked, setPin, verifyPin, lock }
}
