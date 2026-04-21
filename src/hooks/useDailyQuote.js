import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useDailyQuote(userId) {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const orFilter = userId
      ? `user_id.is.null,user_id.eq.${userId}`
      : 'user_id.is.null'
    supabase
      .from('quotes')
      .select('id, text, author')
      .or(orFilter)
      .limit(100)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('[useDailyQuote] load error:', error)
          setQuote(null)
        } else if (data && data.length > 0) {
          const seed = Math.floor(Date.now() / (24 * 60 * 60 * 1000))
          const idx = seed % data.length
          setQuote(data[idx])
        } else {
          setQuote(null)
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  return { quote, loading }
}
