import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Palette keys allowed for a habit color (design tokens only, no raw hex).
export const HABIT_COLORS = ['accent', 'success', 'warning', 'error', 'decor-rose', 'decor-taupe']
export const DEFAULT_COLOR = 'accent'

// Merge the habits list with the 7-day view rows into one shape per habit:
// { id, title, icon, color, sort_order, week: [{date, done}], todayDone, streak }.
function buildHabits(habits, weekRows) {
  // Group week rows by habit_id, sorted by date ascending.
  const byHabit = new Map()
  for (const r of weekRows) {
    if (!byHabit.has(r.habit_id)) byHabit.set(r.habit_id, [])
    byHabit.get(r.habit_id).push({ date: r.date, done: !!r.done })
  }
  for (const arr of byHabit.values()) {
    arr.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  }

  return habits.map((h) => {
    const week = byHabit.get(h.id) || []
    const todayDone = week.length ? week[week.length - 1].done : false
    // Streak: consecutive done days ending today. An unfinished today
    // doesn't break the streak — we skip it (mirrors the water module).
    let streak = 0
    for (let i = week.length - 1; i >= 0; i--) {
      if (week[i].done) {
        streak += 1
      } else if (i === week.length - 1) {
        continue // today not done yet — don't count, don't break
      } else {
        break
      }
    }
    return {
      id: h.id,
      title: h.title,
      icon: h.icon || '',
      color: HABIT_COLORS.includes(h.color) ? h.color : DEFAULT_COLOR,
      sort_order: h.sort_order ?? 0,
      week,
      todayDone,
      streak,
    }
  })
}

export function useHabits() {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id

  const [rawHabits, setRawHabits] = useState([])
  const [weekRows, setWeekRows] = useState([])
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  // Recompute the merged view whenever either source changes.
  useEffect(() => {
    setHabits(buildHabits(rawHabits, weekRows))
  }, [rawHabits, weekRows])

  const loadHabits = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('habits')
      .select('id, title, icon, color, sort_order, is_active, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) {
      console.error('[useHabits] load habits error:', error)
      return
    }
    setRawHabits(data || [])
  }, [userId])

  const loadWeek = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('v_habit_week')
      .select('habit_id, date, done')
    if (error) {
      console.error('[useHabits] load week error:', error)
      return
    }
    setWeekRows(data || [])
  }, [userId])

  const reload = useCallback(async () => {
    await Promise.all([loadHabits(), loadWeek()])
  }, [loadHabits, loadWeek])

  useEffect(() => {
    if (authLoading) return
    if (!userId) {
      setRawHabits([])
      setWeekRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    reload().finally(() => setLoading(false))
  }, [authLoading, userId, reload])

  // Re-sync on returning to the screen (focus / PWA resume), like water.
  useEffect(() => {
    if (!userId) return
    const resync = () => {
      if (document.visibilityState === 'hidden') return
      reload()
    }
    window.addEventListener('focus', resync)
    document.addEventListener('visibilitychange', resync)
    return () => {
      window.removeEventListener('focus', resync)
      document.removeEventListener('visibilitychange', resync)
    }
  }, [userId, reload])

  // Toggle today's done state. Optimistic flip of the last week cell +
  // streak recompute; server date via RPC; rollback on error.
  const toggleToday = useCallback(
    async (habitId) => {
      if (!userId) return
      // Optimistic: flip the last (today) cell for this habit.
      setWeekRows((rows) => {
        const forHabit = rows.filter((r) => r.habit_id === habitId)
        if (!forHabit.length) return rows
        let maxDate = forHabit[0].date
        for (const r of forHabit) if (r.date > maxDate) maxDate = r.date
        return rows.map((r) =>
          r.habit_id === habitId && r.date === maxDate ? { ...r, done: !r.done } : r,
        )
      })

      const { error } = await supabase.rpc('toggle_habit', { p_habit_id: habitId })
      if (error) {
        console.error('[useHabits] toggle_habit error:', error)
        // Rollback by reloading the authoritative week from the DB.
        loadWeek()
        return
      }
      // Refresh week so streak/stats reflect the persisted state.
      loadWeek()
    },
    [userId, loadWeek],
  )

  const createHabit = useCallback(
    async ({ title, icon, color }) => {
      if (!userId) return { error: 'no-user' }
      setBusy(true)
      const nextOrder =
        rawHabits.reduce((m, h) => Math.max(m, h.sort_order ?? 0), 0) + 1
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          title: title.trim(),
          icon: icon || null,
          color: HABIT_COLORS.includes(color) ? color : DEFAULT_COLOR,
          sort_order: nextOrder,
        })
        .select('id, title, icon, color, sort_order, is_active, created_at')
        .single()
      setBusy(false)
      if (error) {
        console.error('[useHabits] create error:', error)
        return { error }
      }
      setRawHabits((prev) => [...prev, data])
      return { data }
    },
    [userId, rawHabits],
  )

  const updateHabit = useCallback(
    async (id, { title, icon, color }) => {
      if (!userId) return { error: 'no-user' }
      setBusy(true)
      const patch = {
        title: title.trim(),
        icon: icon || null,
        color: HABIT_COLORS.includes(color) ? color : DEFAULT_COLOR,
      }
      // Optimistic patch.
      setRawHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)))
      const { error } = await supabase
        .from('habits')
        .update(patch)
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
      setBusy(false)
      if (error) {
        console.error('[useHabits] update error:', error)
        loadHabits() // rollback to DB truth
        return { error }
      }
      return {}
    },
    [userId, loadHabits],
  )

  const deleteHabit = useCallback(
    async (id) => {
      if (!userId) return { error: 'no-user' }
      setBusy(true)
      const prev = rawHabits
      setRawHabits((list) => list.filter((h) => h.id !== id)) // optimistic
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
      setBusy(false)
      if (error) {
        console.error('[useHabits] delete error:', error)
        setRawHabits(prev) // rollback
        return { error }
      }
      return {}
    },
    [userId, rawHabits],
  )

  return {
    habits,
    loading,
    busy,
    toggleToday,
    createHabit,
    updateHabit,
    deleteHabit,
    reload,
  }
}
