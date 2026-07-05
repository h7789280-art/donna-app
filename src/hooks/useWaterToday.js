import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const DEFAULT_GOAL = 8

export function useWaterToday() {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id

  const [cups, setCups] = useState(0)
  const [goal, applyGoal] = useState(DEFAULT_GOAL)
  const [weekly, setWeekly] = useState([]) // [{ log_date, glasses }]
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
      if (data.goal) applyGoal(Number(data.goal))
    }
    setLoading(false)
  }, [userId])

  const loadWeekly = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('v_water_7d')
      .select('log_date, glasses')
      .order('log_date', { ascending: true })
    console.log('[useWaterToday] weekly:', { count: data?.length, error })
    if (error) {
      console.error('[useWaterToday] weekly error:', error)
      return
    }
    if (data) {
      setWeekly(
        data.map((row) => ({
          log_date: row.log_date,
          glasses: Number(row.glasses) || 0,
        })),
      )
    }
  }, [userId])

  useEffect(() => {
    if (authLoading) {
      console.log('[useWaterToday] waiting for auth to resolve')
      return
    }
    if (!userId) {
      setCups(0)
      setWeekly([])
      setLoading(false)
      return
    }
    setLoading(true)
    loadFromView()
    loadWeekly()
  }, [authLoading, userId, loadFromView, loadWeekly])

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
      if (data.goal) applyGoal(Number(data.goal))
    }

    isMutating.current = false
    setAdding(false)
    loadWeekly()
  }, [userId, loadWeekly])

  // NEW: убрать стакан (−1), не уходя ниже нуля. Оптимистично + откат.
  const removeCup = useCallback(async () => {
    if (!userId || isMutating.current) return
    let didChange = false
    setCups((g) => {
      if (g <= 0) return 0
      didChange = true
      return g - 1
    })
    if (!didChange) return

    isMutating.current = true
    setAdding(true)

    const { error } = await supabase.rpc('remove_water')
    console.log('[useWaterToday] remove_water RPC:', { error })

    if (error) {
      console.error('[useWaterToday] remove_water error:', error)
      setCups((g) => g + 1) // откат
      isMutating.current = false
      setAdding(false)
      return
    }

    const { data } = await supabase
      .from('v_water_today')
      .select('glasses, goal')
      .maybeSingle()
    if (data) {
      setCups(Number(data.glasses) || 0)
      if (data.goal) applyGoal(Number(data.goal))
    }

    isMutating.current = false
    setAdding(false)
    loadWeekly()
  }, [userId, loadWeekly])

  // NEW: менять цель воды (profiles.water_goal). Оптимистично + откат.
  const setGoal = useCallback(
    async (n) => {
      if (!userId) return
      const next = Math.max(1, Math.min(30, Math.round(Number(n) || 0)))
      const prev = goal
      if (next === prev) return
      applyGoal(next)

      const { error } = await supabase
        .from('profiles')
        .update({ water_goal: next })
        .eq('user_id', userId)
        .select()
      console.log('[useWaterToday] setGoal:', { next, error })

      if (error) {
        console.error('[useWaterToday] setGoal error:', error)
        applyGoal(prev) // откат
      }
    },
    [userId, goal],
  )

  return { cups, goal, weekly, loading, adding, add, removeCup, setGoal }
}
