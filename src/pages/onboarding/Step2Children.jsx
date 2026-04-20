import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

function calcAge(birthDate) {
  if (!birthDate) return null
  const today = new Date()
  const b = new Date(birthDate)
  if (Number.isNaN(b.getTime())) return null
  let years = today.getFullYear() - b.getFullYear()
  const m = today.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) years -= 1
  if (years < 0) return null
  return years
}

const MAX_AGE_YEARS = 30

export default function Step2Children({ value = [], onChange }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('children')
        .select('id, name, birth_date, sort_order, created_at')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (cancelled) return
      console.log('[Onboarding Step 2] loading existing children', data)
      if (error) {
        console.error('[Onboarding Step 2] load error:', error)
        setLoadError(t('onboarding.step2_load_failed'))
        setLoading(false)
        return
      }
      if (data && data.length > 0) {
        onChange(
          data.map((c) => ({ id: c.id, name: c.name, birth_date: c.birth_date })),
        )
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const resetForm = () => {
    setName('')
    setBirth('')
    setAdding(false)
    setFormError('')
  }

  const handleSave = () => {
    const trimmed = name.trim()
    if (trimmed.length < 1 || !birth) return
    const d = new Date(birth)
    if (Number.isNaN(d.getTime())) {
      setFormError(t('onboarding.step2_date_invalid'))
      return
    }
    const now = new Date()
    if (d > now) {
      setFormError(t('onboarding.step2_date_future'))
      return
    }
    const minDate = new Date()
    minDate.setFullYear(minDate.getFullYear() - MAX_AGE_YEARS)
    if (d < minDate) {
      setFormError(t('onboarding.step2_date_too_old', { max: MAX_AGE_YEARS }))
      return
    }
    onChange([...value, { name: trimmed, birth_date: birth }])
    resetForm()
  }

  const handleRemove = (idx) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  const canSave = name.trim().length >= 1 && !!birth
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center">
        <h1 className="font-serif italic text-4xl text-accent mb-3">{t('onboarding.step2_title')}</h1>
        <p className="font-sans text-sm text-ink-muted mb-8">
          {t('onboarding.step2_subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2.5">
          <div className="h-[68px] rounded-2xl bg-card border border-line animate-pulse" />
          <div className="h-[68px] rounded-2xl bg-card border border-line animate-pulse opacity-60" />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {value.map((child, idx) => {
              const years = calcAge(child.birth_date)
              return (
                <motion.div
                  key={child.id ?? `${child.name}-${child.birth_date}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card border border-line rounded-2xl px-5 py-4 flex items-center gap-3 shadow-card"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--decor-rose-soft)] flex items-center justify-center text-accent font-serif italic text-lg shrink-0">
                    {child.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-ink text-md truncate">{child.name}</div>
                    {years != null && (
                      <div className="font-sans text-xs text-ink-muted mt-0.5">
                        {t('onboarding.step2_years', { count: years })}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    aria-label={t('common.delete')}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-accent hover:bg-canvas-soft transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 4h10M6.5 4V3a1 1 0 011-1h1a1 1 0 011 1v1M5 4l.5 9a1 1 0 001 1h3a1 1 0 001-1l.5-9"
                        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            {adding ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-line rounded-2xl p-4 flex flex-col gap-3 shadow-card">
                  <div>
                    <label className="font-mono text-xs uppercase tracking-label text-ink-muted block mb-2">
                      {t('onboarding.step2_child_name_label')}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); if (formError) setFormError('') }}
                      placeholder={t('onboarding.step2_child_name_placeholder')}
                      autoFocus
                      maxLength={50}
                      className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-ink font-sans text-md placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-label text-ink-muted block mb-2">
                      {t('onboarding.step2_child_birthdate_label')}
                    </label>
                    <input
                      type="date"
                      value={birth}
                      max={today}
                      onChange={(e) => { setBirth(e.target.value); if (formError) setFormError('') }}
                      className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-ink font-sans text-md placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  {formError && (
                    <p className="font-sans text-sm text-accent">{formError}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-2.5 rounded-full border border-line text-ink-soft font-sans text-sm hover:bg-canvas-soft transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!canSave}
                      className={`flex-1 py-2.5 rounded-full bg-accent text-accent-ink font-sans text-sm transition-opacity ${
                        !canSave ? 'opacity-50' : ''
                      }`}
                    >
                      {t('common.save')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="add"
                type="button"
                onClick={() => setAdding(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full rounded-2xl border border-dashed border-line-strong px-5 py-4 flex items-center justify-center gap-2 text-ink-soft font-sans text-sm hover:border-accent hover:text-accent transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {t('onboarding.step2_add_child')}
              </motion.button>
            )}
          </AnimatePresence>

          {loadError && (
            <p className="font-sans text-sm text-accent text-center mt-2">{loadError}</p>
          )}
        </div>
      )}
    </div>
  )
}
