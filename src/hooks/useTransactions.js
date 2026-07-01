import { useCallback } from 'react'
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

  return { addTransaction }
}
