import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useChildren(userId) {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setChildren([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('children')
      .select('id, name, birth_date, sort_order, created_at')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          console.error('[useChildren] load error:', err)
          setError(err)
          setChildren([])
        } else {
          setChildren(data || [])
          setError(null)
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  return { children, loading, error }
}
