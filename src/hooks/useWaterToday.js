import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const DEFAULT_GOAL = 8

export function useWaterToday() {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id

  const [cups, setCups] = useState(0)
  const [goal, setGoalState] = useState(DEFAULT_GOAL)
  const [weekly, setWeekly] = useState([]) // [{ date, glasses, goal }]
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [goalSaved, setGoalSaved] = useState(false)
  const isMutating = useRef(false)

  // goalRef mirrors `goal` synchronously so rapid +/− taps accumulate
  // correctly even before React re-renders (avoids stale-closure reads).
  const goalRef = useRef(DEFAULT_GOAL)
  const goalTimer = useRef(null)
  const savedTimer = useRef(null)

  // Set the goal in both state (for render) and ref (for logic) at once.
  const applyGoal = useCallback((n) => {
    goalRef.current = n
    setGoalState(n)
  }, [])

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
      // Применяем цель всегда, когда БД её вернула (!= null), чтобы свежее
      // значение из v_water_today не оставалось на DEFAULT_GOAL=8.
      if (data.goal != null) applyGoal(Number(data.goal))
    }
    setLoading(false)
  }, [userId, applyGoal])

  const loadWeekly = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('v_water_7d')
      .select('date, glasses, goal')
      .order('date', { ascending: true })
    console.log('[useWaterToday] weekly:', { count: data?.length, error })
    if (error) {
      console.error('[useWaterToday] weekly error:', error)
      return
    }
    if (data) {
      setWeekly(
        data.map((row) => ({
          date: row.date,
          glasses: Number(row.glasses) || 0,
          goal: Number(row.goal) || DEFAULT_GOAL,
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

  // Перечитывать свежие glasses/goal из v_water_today при возврате на экран:
  // фокус окна и разворачивание PWA (visibilitychange). React не перемонтирует
  // уже открытое приложение при resume, поэтому без этого на экране остаются
  // старые значения (напр. DEFAULT_GOAL=8), даже если в БД уже 9/11.
  // Тихий рефетч (без setLoading), чтобы не мигал спиннер; loadFromView сам
  // пропускает загрузку, если идёт мутация (isMutating).
  useEffect(() => {
    if (!userId) return
    const resync = () => {
      if (document.visibilityState === 'hidden') return
      loadFromView()
      loadWeekly()
    }
    window.addEventListener('focus', resync)
    document.addEventListener('visibilitychange', resync)
    return () => {
      window.removeEventListener('focus', resync)
      document.removeEventListener('visibilitychange', resync)
    }
  }, [userId, loadFromView, loadWeekly])

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
      if (data.goal != null) applyGoal(Number(data.goal))
    }

    isMutating.current = false
    setAdding(false)
    loadWeekly()
  }, [userId, loadWeekly, applyGoal])

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
      if (data.goal != null) applyGoal(Number(data.goal))
    }

    isMutating.current = false
    setAdding(false)
    loadWeekly()
  }, [userId, loadWeekly, applyGoal])

  // Записать цель в БД (debounced). Оптимистично уже применено в UI —
  // здесь только пишем в water_log.goal и даём фидбек «сохранено».
  const persistGoal = useCallback(
    async (value) => {
      if (!userId) return
      const { error } = await supabase.rpc('set_water_goal', { p_goal: value })
      console.log('[useWaterToday] set_water_goal RPC:', { value, error })

      if (error) {
        console.error('[useWaterToday] setGoal error:', error)
        // Откат: перечитать реальную цель из БД.
        const { data } = await supabase
          .from('v_water_today')
          .select('glasses, goal')
          .maybeSingle()
        if (data?.goal != null) applyGoal(Number(data.goal))
        return
      }

      // Пересинхронизировать сегодняшнюю вьюху и недельную статистику.
      const { data } = await supabase
        .from('v_water_today')
        .select('glasses, goal')
        .maybeSingle()
      if (data) {
        setCups(Number(data.glasses) || 0)
        if (data.goal != null) applyGoal(Number(data.goal))
      }
      loadWeekly()

      // Мягкий фидбек «Цель обновлена» на ~1.5с.
      setGoalSaved(true)
      if (savedTimer.current) clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setGoalSaved(false), 1500)
    },
    [userId, applyGoal, loadWeekly],
  )

  // Изменить цель на delta (±1). Мгновенно в UI, запись в БД — debounce,
  // чтобы быстрый +/+/+ ушёл одним запросом. goalRef убирает stale-closure.
  const nudgeGoal = useCallback(
    (delta) => {
      if (!userId) return
      const next = Math.max(1, Math.min(20, goalRef.current + delta))
      if (next === goalRef.current) return
      applyGoal(next)

      if (goalTimer.current) clearTimeout(goalTimer.current)
      goalTimer.current = setTimeout(() => persistGoal(next), 500)
    },
    [userId, applyGoal, persistGoal],
  )

  // Очистить таймеры при размонтировании.
  useEffect(() => {
    return () => {
      if (goalTimer.current) clearTimeout(goalTimer.current)
      if (savedTimer.current) clearTimeout(savedTimer.current)
    }
  }, [])

  return {
    cups,
    goal,
    weekly,
    loading,
    adding,
    goalSaved,
    add,
    removeCup,
    nudgeGoal,
  }
}
