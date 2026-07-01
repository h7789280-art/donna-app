import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Writes a single expense/income row and keeps the wallet balance in sync.
// Balance recompute is "variant A": read the fresh balance, apply the signed
// delta, write it back. RLS scopes every statement to auth.uid(); we still pass
// user_id explicitly on INSERT and on the balance read/write (same style as
// useWallets) so the row can never leak across accounts.
const WALLETS = 'wallets'

export function useTransactions() {
  const { user } = useAuth()
  const userId = user?.id

  // State for the unified operations feed (expenses + income merged).
  const [transactions, setTransactions] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState(null)

  const addTransaction = useCallback(
    async ({ kind, walletId, amount, categoryId, categoryName, description, date, currency }) => {
      if (!userId) return { ok: false, error: 'no-user' }
      if (!walletId) return { ok: false, error: 'no-wallet' }

      const numericAmount = parseFloat(amount)
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return { ok: false, error: 'invalid-amount' }
      }

      const table = kind === 'income' ? 'income' : 'expenses'

      // 1) Insert the operation. If this fails we never touch the balance.
      const { error: insertErr } = await supabase
        .from(table)
        .insert({
          user_id: userId,
          wallet_id: walletId,
          amount: numericAmount,
          currency,
          category: categoryName ?? null,
          category_id: categoryId ?? null,
          description: description?.trim() ? description.trim() : null,
          date,
        })
        .select()
      if (insertErr) {
        console.error('[useTransactions] insert error:', insertErr)
        return { ok: false, error: insertErr }
      }

      // 2) Read the fresh wallet balance (never trust stale client state).
      const { data: walletRows, error: readErr } = await supabase
        .from(WALLETS)
        .select('balance')
        .eq('id', walletId)
        .eq('user_id', userId)
        .single()
      if (readErr) {
        console.error('[useTransactions] balance read error:', readErr)
        // The operation is saved but the balance couldn't be recomputed — surface
        // it honestly rather than silently drifting.
        return { ok: false, error: readErr, balanceStale: true }
      }

      // 3) Apply the signed delta and write it back.
      const current = Number(walletRows?.balance) || 0
      const delta = kind === 'income' ? numericAmount : -numericAmount
      const next = current + delta
      const { error: updateErr } = await supabase
        .from(WALLETS)
        .update({ balance: next })
        .eq('id', walletId)
        .eq('user_id', userId)
        .select()
      if (updateErr) {
        console.error('[useTransactions] balance update error:', updateErr)
        return { ok: false, error: updateErr, balanceStale: true }
      }

      return { ok: true, error: null }
    },
    [userId]
  )

  // Read the last operations from BOTH tables, tag each with `kind`, merge and
  // sort newest-first (by date, then created_at), keep the first `limit`.
  const listTransactions = useCallback(
    async ({ limit = 50 } = {}) => {
      if (!userId) {
        setTransactions([])
        setListLoading(false)
        return []
      }
      setListLoading(true)

      const columns = 'id, wallet_id, amount, currency, category, category_id, description, date, created_at'
      const [expRes, incRes] = await Promise.all([
        supabase
          .from('expenses')
          .select(columns)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('income')
          .select(columns)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit),
      ])

      if (expRes.error || incRes.error) {
        const err = expRes.error || incRes.error
        console.error('[useTransactions] list error:', err)
        setListError(err)
        setListLoading(false)
        return []
      }

      const rows = [
        ...(expRes.data || []).map((r) => ({ ...r, kind: 'expense' })),
        ...(incRes.data || []).map((r) => ({ ...r, kind: 'income' })),
      ]
      // Sort newest-first: date descending, then created_at as a tie-breaker.
      rows.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1
        const ca = a.created_at || ''
        const cb = b.created_at || ''
        if (ca !== cb) return ca < cb ? 1 : -1
        return 0
      })
      const merged = rows.slice(0, limit)

      setListError(null)
      setTransactions(merged)
      setListLoading(false)
      return merged
    },
    [userId]
  )

  // Delete one operation and roll the wallet balance back by the reverse delta
  // (variant A): removing an expense returns the money (balance += amount),
  // removing an income takes it away (balance -= amount). If the DELETE fails we
  // never touch the balance; if the balance write fails after a successful
  // delete we report balanceStale so the caller can warn honestly.
  const deleteTransaction = useCallback(
    async ({ id, kind, walletId, amount }) => {
      if (!userId) return { ok: false, error: 'no-user' }

      const table = kind === 'income' ? 'income' : 'expenses'

      // 1) Delete the row. Balance stays untouched if this fails.
      const { error: deleteErr } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
      if (deleteErr) {
        console.error('[useTransactions] delete error:', deleteErr)
        return { ok: false, error: deleteErr }
      }

      // No wallet attached (or nothing to reverse) — nothing left to do.
      const numericAmount = Number(amount) || 0
      if (!walletId || numericAmount === 0) {
        return { ok: true, error: null }
      }

      // 2) Read the fresh balance (never trust stale client state).
      const { data: walletRow, error: readErr } = await supabase
        .from(WALLETS)
        .select('balance')
        .eq('id', walletId)
        .eq('user_id', userId)
        .single()
      if (readErr) {
        console.error('[useTransactions] balance read error:', readErr)
        return { ok: false, error: readErr, balanceStale: true }
      }

      // 3) Apply the REVERSE delta and write it back.
      const current = Number(walletRow?.balance) || 0
      const reverse = kind === 'income' ? -numericAmount : numericAmount
      const next = current + reverse
      const { error: updateErr } = await supabase
        .from(WALLETS)
        .update({ balance: next })
        .eq('id', walletId)
        .eq('user_id', userId)
        .select()
      if (updateErr) {
        console.error('[useTransactions] balance update error:', updateErr)
        return { ok: false, error: updateErr, balanceStale: true }
      }

      return { ok: true, error: null }
    },
    [userId]
  )

  return {
    addTransaction,
    transactions,
    listLoading,
    listError,
    listTransactions,
    deleteTransaction,
  }
}
