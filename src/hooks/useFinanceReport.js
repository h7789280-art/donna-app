import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useFinanceCategories } from './useFinanceCategories'

// Aggregates the user's EXPENSES for one currency over a [from, to] date range
// into a two-level report. RLS scopes rows to auth.uid(), so SELECT needs no
// explicit user_id filter (same style as useTransactions/useWallets).
//
// Two-level roll-up:
//   * parents[] — every parent category gets the sum of everything in its
//     branch. An operation booked straight on the parent (category_id = the
//     parent's id) and one booked on a child (category_id = a subcategory) both
//     fold into the SAME parent bucket.
//   * childrenOf(parentId) — inside one parent, the sum per subcategory PLUS a
//     dedicated "no subcategory" row (subId === null) for operations booked
//     directly on the parent.
// Operations with category_id === null collapse into a pseudo "no category"
// bucket keyed by NO_CATEGORY (name === null → the screen localises the label).

// Sentinel parent key for operations without a category_id.
export const NO_CATEGORY = '__none__'

const TABLE = 'expenses'

export function useFinanceReport({ currency, from, to }) {
  const { user } = useAuth()
  const userId = user?.id

  // Category tree: we need id → { name, parent_id } to fold children into parents.
  const { categories, loading: catsLoading, error: catsError } = useFinanceCategories()

  const [rows, setRows] = useState([]) // raw expense rows for the current filter
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
      .select('amount, category_id, category, currency, date')
      .eq('currency', currency)
      .gte('date', from)
      .lte('date', to)
    if (err) {
      console.error('[useFinanceReport] load error:', err)
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

  const byId = useMemo(() => {
    const m = new Map()
    for (const c of categories) m.set(c.id, c)
    return m
  }, [categories])

  // Fold every expense into its parent bucket and, within it, its subcategory
  // bucket. Names come from the category tree where available; pseudo buckets
  // carry name === null so the UI can localise "No category"/"No subcategory".
  const { total, parents, subsMap } = useMemo(() => {
    // parentKey -> { key, name, sum, subs: Map(subKey -> { key, name, sum }) }
    const pMap = new Map()

    const ensureParent = (key, name) => {
      let p = pMap.get(key)
      if (!p) {
        p = { key, name: name ?? null, sum: 0, subs: new Map() }
        pMap.set(key, p)
      } else if (p.name == null && name != null) {
        p.name = name
      }
      return p
    }
    const addSub = (parent, subKey, subName, amount) => {
      let s = parent.subs.get(subKey)
      if (!s) {
        s = { key: subKey, name: subName ?? null, sum: 0 }
        parent.subs.set(subKey, s)
      } else if (s.name == null && subName != null) {
        s.name = subName
      }
      s.sum += amount
    }

    let grand = 0
    for (const r of rows) {
      const amount = Number(r.amount) || 0
      if (!amount) continue
      grand += amount

      const catId = r.category_id
      let parentKey
      let parentName
      let subKey = null // null → the parent's "no subcategory" bucket
      let subName = null

      if (catId == null) {
        parentKey = NO_CATEGORY
        parentName = null
      } else {
        const cat = byId.get(catId)
        if (!cat) {
          // Category was deleted after the operation — keep it visible on its
          // own using the name stored on the expense row.
          parentKey = catId
          parentName = r.category || null
        } else if (cat.parent_id == null) {
          // Booked straight on a parent → parent bucket, no subcategory.
          parentKey = cat.id
          parentName = cat.name
        } else {
          // Booked on a subcategory → fold into its parent.
          parentKey = cat.parent_id
          const parentCat = byId.get(cat.parent_id)
          parentName = parentCat?.name ?? r.category ?? null
          subKey = cat.id
          subName = cat.name
        }
      }

      const parent = ensureParent(parentKey, parentName)
      parent.sum += amount
      addSub(parent, subKey, subName, amount)
    }

    const parentsArr = [...pMap.values()]
      .map((p) => ({
        parentId: p.key,
        name: p.name,
        sum: p.sum,
        share: grand > 0 ? (p.sum / grand) * 100 : 0,
      }))
      .sort((a, b) => b.sum - a.sum)

    // Subcategory rows per parent, sorted desc, share relative to the parent sum.
    const sMap = new Map()
    for (const p of pMap.values()) {
      const arr = [...p.subs.values()]
        .map((s) => ({
          subId: s.key,
          name: s.name,
          sum: s.sum,
          share: p.sum > 0 ? (s.sum / p.sum) * 100 : 0,
        }))
        .sort((a, b) => b.sum - a.sum)
      sMap.set(p.key, arr)
    }

    return { total: grand, parents: parentsArr, subsMap: sMap }
  }, [rows, byId])

  const childrenOf = useCallback((parentId) => subsMap.get(parentId) || [], [subsMap])

  return {
    total,
    parents,
    childrenOf,
    loading: loading || catsLoading,
    error: error || catsError,
    reload: load,
  }
}
