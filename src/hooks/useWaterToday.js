import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const DEFAULT_GOAL = 8

export function useWaterToday() {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id

  const [cups, setCups] = useState(0)
  const [goal, setGoal] = useState(DEFAULT_GOAL)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const isMutating = useRef(false)

  const loadFromView = useCallback(async () => {
    if (!userId) {
      console.log('[useWaterToday] skip load — no user yet')
      return
    }
    if (isMutating.current) {
      console.log('[useWaterToday] load skipped: mutation in progress')
      return
    }
    const { data, error } = await supabase
      .from('v_water_today')
      .select('glasses, goal')
      .maybeSingle()
    console.log('[useWaterToday] load:', { data, error, userId })
    if (error) {
      console.error('[useWaterToday] load error:', error)
      setLoading(false)
      return
    }
    if (data) {
      setCups(Number(data.glasses) || 0)
      if (data.goal) setGoal(Number(data.goal))
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (authLoading) {
      console.log('[useWaterToday] waiting for auth to resolve')
      return
    }
    if (!userId) {
      setCups(0)
      setLoading(false)
      return
    }
    setLoading(true)
    loadFromView()
  }, [authLoading, userId, loadFromView])

  const add = useCallback(async () => {
    if (!userId || isMutating.current) return
    isMutating.current = true
    setAdding(true)
    setCups((g) => g + 1)

    const { error } = await supabase.rpc('add_water')
    console.log('[useWaterToday] add_water RPC:', { error })

    if (error) {
      console.error('[useWaterToday] add_water error:', error)
      setCups((g) => Math.max(0, g - 1))
      isMutating.current = false
      setAdding(false)
      return
    }

    const { data, error: reloadError } = await supabase
      .from('v_water_today')
      .select('glasses, goal')
      .maybeSingle()
    console.log('[useWaterToday] post-rpc reload:', { data, reloadError })

    if (data) {
      setCups(Number(data.glasses) || 0)
      if (data.goal) setGoal(Number(data.goal))
    }

    isMutating.current = false
    setAdding(false)
  }, [userId])

  return { cups, goal, loading, adding, add }
}
