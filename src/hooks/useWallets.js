import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// CRUD for finance wallets. RLS scopes every row to auth.uid(), so SELECT needs
// no explicit user_id filter; we only set user_id on INSERT and pass it on the
// "clear all defaults" sweeps (same style as useFinancePin). Every mutation
// does .select() and surfaces errors instead of swallowing them.
const TABLE = 'wallets'

export function useWallets() {
  const { user } = useAuth()
  const userId = user?.id

  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!userId) {
      setWallets([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from(TABLE)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (err) {
      console.error('[useWallets] load error:', err)
      setError(err)
      setWallets([])
    } else {
      setError(null)
      setWallets(data || [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  // Drop the is_default flag from whichever wallet currently holds it. Returns
  // the Supabase error (or null) so callers can bail before the second write.
  const clearDefault = useCallback(async () => {
    const { error: err } = await supabase
      .from(TABLE)
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)
      .select()
    if (err) console.error('[useWallets] clearDefault error:', err)
    return err
  }, [userId])

  const createWallet = useCallback(
    async ({ name, type, currency, balance, is_default }) => {
      if (!userId) return { ok: false, error: 'no-user' }
      // The very first wallet of an account always becomes the default one,
      // even if the caller didn't ask for it.
      const makeDefault = Boolean(is_default) || wallets.length === 0
      if (makeDefault) {
        const clearErr = await clearDefault()
        if (clearErr) return { ok: false, error: clearErr }
      }
      const { data, error: err } = await supabase
        .from(TABLE)
        .insert({ user_id: userId, name, type, currency, balance, is_default: makeDefault })
        .select()
      if (err) {
        console.error('[useWallets] createWallet error:', err)
        return { ok: false, error: err }
      }
      await load()
      return { ok: true, error: null, data: data?.[0] ?? null }
    },
    [userId, wallets.length, clearDefault, load]
  )

  const updateWallet = useCallback(
    async (id, updates) => {
      if (!userId) return { ok: false, error: 'no-user' }
      // Promoting this wallet to default? Demote the current default first.
      if (updates.is_default === true) {
        const clearErr = await clearDefault()
        if (clearErr) return { ok: false, error: clearErr }
      }
      const { data, error: err } = await supabase
        .from(TABLE)
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
      if (err) {
        console.error('[useWallets] updateWallet error:', err)
        return { ok: false, error: err }
      }
      await load()
      return { ok: true, error: null, data: data?.[0] ?? null }
    },
    [userId, clearDefault, load]
  )

  const deleteWallet = useCallback(
    async (id) => {
      if (!userId) return { ok: false, error: 'no-user' }
      const removed = wallets.find((w) => w.id === id)
      const { error: err } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
      if (err) {
        console.error('[useWallets] deleteWallet error:', err)
        return { ok: false, error: err }
      }
      // Keep exactly one default alive: if we deleted the default and other
      // wallets remain, promote the first survivor.
      const remaining = wallets.filter((w) => w.id !== id)
      if (removed?.is_default && remaining.length > 0) {
        const { error: heirErr } = await supabase
          .from(TABLE)
          .update({ is_default: true })
          .eq('id', remaining[0].id)
          .eq('user_id', userId)
          .select()
        if (heirErr) console.error('[useWallets] promote default error:', heirErr)
      }
      await load()
      return { ok: true, error: null }
    },
    [userId, wallets, load]
  )

  const setDefault = useCallback(
    async (id) => {
      if (!userId) return { ok: false, error: 'no-user' }
      const clearErr = await clearDefault()
      if (clearErr) return { ok: false, error: clearErr }
      const { error: err } = await supabase
        .from(TABLE)
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
      if (err) {
        console.error('[useWallets] setDefault error:', err)
        return { ok: false, error: err }
      }
      await load()
      return { ok: true, error: null }
    },
    [userId, clearDefault, load]
  )

  return {
    wallets,
    loading,
    error,
    reload: load,
    createWallet,
    updateWallet,
    deleteWallet,
    setDefault,
  }
}
