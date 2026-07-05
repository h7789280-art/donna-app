import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Reads/writes the customizable-dashboard config stored in
// profiles.dashboard_config (JSONB). Shape: { widgets: ["water", "habits"] }
// — an ordered array of enabled widget keys; the order is the render order
// on the dashboard. Missing column/row/field ⇒ empty (no widgets).
//
// profiles already has UPDATE granted to `authenticated` (AuthContext syncs
// profiles.language the same way), so no extra GRANT is needed here.

function normalizeWidgets(config) {
  const arr = config && Array.isArray(config.widgets) ? config.widgets : []
  // Keep only string keys, de-duplicated, order preserved.
  const seen = new Set()
  const out = []
  for (const k of arr) {
    if (typeof k === 'string' && !seen.has(k)) {
      seen.add(k)
      out.push(k)
    }
  }
  return out
}

export function useDashboardConfig() {
  const { user, profile, refreshProfile } = useAuth()
  const userId = user?.id

  // Server truth derived from the loaded profile.
  const serverWidgets = useMemo(
    () => normalizeWidgets(profile?.dashboard_config),
    [profile?.dashboard_config],
  )

  const [widgets, setWidgets] = useState(serverWidgets)
  const [saving, setSaving] = useState(false)
  // While a write is in flight we keep the optimistic value and ignore
  // server re-syncs (avoids a flash back to the old array before refresh).
  const pendingRef = useRef(false)

  useEffect(() => {
    if (!pendingRef.current) setWidgets(serverWidgets)
  }, [serverWidgets])

  const isEnabled = useCallback((key) => widgets.includes(key), [widgets])

  const toggle = useCallback(
    async (key) => {
      if (!userId) return
      const prev = widgets
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]

      // Optimistic.
      setWidgets(next)
      pendingRef.current = true
      setSaving(true)

      const nextConfig = { ...(profile?.dashboard_config || {}), widgets: next }
      const { error } = await supabase
        .from('profiles')
        .update({ dashboard_config: nextConfig })
        .eq('user_id', userId)

      if (error) {
        console.error('[useDashboardConfig] toggle error:', error)
        setWidgets(prev) // rollback
      } else {
        await refreshProfile() // keep AuthContext.profile in sync
      }
      pendingRef.current = false
      setSaving(false)
    },
    [userId, widgets, profile?.dashboard_config, refreshProfile],
  )

  return { widgets, isEnabled, toggle, saving }
}
