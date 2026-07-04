import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Lightweight companion to useFinanceReport: loads ONLY the raw
// (amount, date) of the user's expenses for one currency across a WIDE range
// [from, to] — wide enough to cover both the "previous period" comparison and
// the last-6-months chart, neither of which fits the current period window.
//
// It deliberately does NOT aggregate by category (that stays in
// useFinanceReport). The screen buckets these rows by day/month itself.
// RLS scopes rows to auth.uid(), so SELECT needs no explicit user_id filter.

const TABLE = 'expenses'

export function useExpenseTrends({ currency, from, to }) {
  const { user } = useAuth()
  const userId = user?.id

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!userId || !currency || !from || !to) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from(TABLE)
      .select('amount, date')
      .eq('currency', currency)
      .gte('date', from)
      .lte('date', to)
    if (err) {
      console.error('[useExpenseTrends] load error:', err)
      setError(err)
      setRows([])
    } else {
      setError(null)
      setRows(data || [])
    }
    setLoading(false)
  }, [userId, currency, from, to])

  useEffect(() => {
    load()
  }, [load])

  return { rows, loading, error, reload: load }
}
