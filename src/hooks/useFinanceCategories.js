import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Reads the user's finance categories. RLS scopes rows to auth.uid(), so SELECT
// needs no explicit user_id filter (same style as useWallets). Rows form a
// two-level tree: parents have parent_id === null, subcategories point at their
// parent's id. `type` is 'expense' | 'income'.
const TABLE = 'finance_categories'

export function useFinanceCategories() {
  const { user } = useAuth()
  const userId = user?.id

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!userId) {
      setCategories([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from(TABLE)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (err) {
      console.error('[useFinanceCategories] load error:', err)
      setError(err)
      setCategories([])
    } else {
      setError(null)
      setCategories(data || [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  // Parent categories of the given type ('expense' | 'income'), already sorted
  // by the SELECT above.
  const parents = useCallback(
    (type) => categories.filter((c) => c.parent_id == null && c.type === type),
    [categories]
  )

  // Subcategories of a given parent id, in the same sort order.
  const children = useCallback(
    (parentId) => categories.filter((c) => c.parent_id === parentId),
    [categories]
  )

  return useMemo(
    () => ({ categories, loading, error, reload: load, parents, children }),
    [categories, loading, error, load, parents, children]
  )
}
