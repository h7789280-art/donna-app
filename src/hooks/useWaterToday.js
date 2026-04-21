import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_GOAL = 8

export function useWaterToday(userId) {
  const [cups, setCups] = useState(0)
  const [goal, setGoal] = useState(DEFAULT_GOAL)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    if (!userId) {
      setCups(0)
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('v_water_today')
      .select('glasses, goal')
      .maybeSingle()
    console.log('[useWaterToday] load:', { data, error })
    if (error) {
      console.error('[useWaterToday] load error:', error)
      setCups(0)
    } else if (data) {
      setCups(Number(data.glasses) || 0)
      if (data.goal) setGoal(Number(data.goal))
    } else {
      setCups(0)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const add = useCallback(async () => {
    if (!userId || adding) return
    setAdding(true)
    const prev = cups
    setCups(prev + 1)
    const { data, error } = await supabase.rpc('add_water')
    console.log('[useWaterToday] add_water RPC:', { data, error })
    if (error) {
      console.error('[useWaterToday] add_water error:', error)
      setCups(prev)
    } else {
      await load()
    }
    setAdding(false)
  }, [userId, cups, adding, load])

  return { cups, goal, loading, adding, add }
}
