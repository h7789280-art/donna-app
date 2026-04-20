import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import OnboardingLayout from './OnboardingLayout'
import Step1Name from './Step1Name'
import Step2Children from './Step2Children'
import Step3Modules from './Step3Modules'
import Step4Assistant from './Step4Assistant'
import Step5Preparing from './Step5Preparing'
import Step6Finish from './Step6Finish'
import { TONE_KEYS, DEFAULT_TONE } from '../../config/tones'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const TOTAL_STEPS = 6

const TIME_RE = /^\d{2}:\d{2}$/

const normalizeTime = (raw, fallback) => {
  if (!raw) return fallback
  const trimmed = String(raw).slice(0, 5)
  return TIME_RE.test(trimmed) ? trimmed : fallback
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [step2Error, setStep2Error] = useState('')
  const [step3Error, setStep3Error] = useState('')
  const [step4Error, setStep4Error] = useState('')
  const [step6Error, setStep6Error] = useState('')
  const [assistantLoaded, setAssistantLoaded] = useState(false)

  const defaultAssistant = {
    name: t('onboarding.step4_name_placeholder'),
    tone: DEFAULT_TONE,
    morningTime: '07:30',
    eveningTime: '21:00',
  }

  const [data, setData] = useState({
    name: '',
    children: [],
    modules: [],
    assistant: { ...defaultAssistant },
  })

  useEffect(() => {
    if (step !== 4 || assistantLoaded || !user?.id) return
    let cancelled = false
    ;(async () => {
      const { data: row, error } = await supabase
        .from('profiles')
        .select('assistant_name, assistant_tone, morning_digest_time, evening_digest_time')
        .eq('user_id', user.id)
        .single()
      if (cancelled) return
      if (error) {
        console.error('[Onboarding Step 4] Load error:', error)
        setAssistantLoaded(true)
        return
      }
      const tone = TONE_KEYS.includes(row?.assistant_tone) ? row.assistant_tone : defaultAssistant.tone
      setData((prev) => ({
        ...prev,
        assistant: {
          name: row?.assistant_name?.trim() || defaultAssistant.name,
          tone,
          morningTime: normalizeTime(row?.morning_digest_time, defaultAssistant.morningTime),
          eveningTime: normalizeTime(row?.evening_digest_time, defaultAssistant.eveningTime),
        },
      }))
      setAssistantLoaded(true)
    })()
    return () => {
      cancelled = true
    }
  }, [step, assistantLoaded, user?.id])

  const handleFinish = async () => {
    if (finishing) return
    if (!user?.id) {
      setStep6Error(t('onboarding.error_no_user'))
      return
    }
    setFinishing(true)
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', user.id)
    setFinishing(false)
    if (error) {
      console.error('[Onboarding Step 6] Supabase error:', error)
      setStep6Error(t('onboarding.save_failed', { error: error.message }))
      return
    }
    navigate('/', { replace: true })
  }

  const saveChildren = async (overrideList) => {
    if (!user?.id) {
      console.error('[Onboarding Step 2] No user.id — cannot replace children')
      setStep2Error(t('onboarding.error_no_user'))
      return false
    }

    const newList = Array.isArray(overrideList) ? overrideList : data.children

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('children')
        .select('id')
        .eq('user_id', user.id)

      if (fetchErr) {
        console.error('[Onboarding Step 2] Fetch existing error:', fetchErr)
        setStep2Error(t('onboarding.save_failed', { error: fetchErr.message }))
        return false
      }

      console.log('[Onboarding Step 2] replacing children', {
        deleted: existing?.length ?? 0,
        inserted: newList.length,
      })

      const { error: delErr } = await supabase
        .from('children')
        .delete()
        .eq('user_id', user.id)

      if (delErr) {
        console.error('[Onboarding Step 2] Delete error:', delErr)
        setStep2Error(t('onboarding.save_failed', { error: delErr.message }))
        return false
      }

      if (newList.length === 0) {
        setStep2Error('')
        return true
      }

      const rows = newList.map((c, idx) => ({
        user_id: user.id,
        name: c.name.trim(),
        birth_date: c.birth_date,
        sort_order: idx,
      }))

      const { data: inserted, error: insErr } = await supabase
        .from('children')
        .insert(rows)
        .select()

      if (insErr) {
        console.error('[Onboarding Step 2] Insert error:', insErr)
        setStep2Error(t('onboarding.save_failed', { error: insErr.message }))
        return false
      }

      console.log('[Onboarding Step 2] Replace success:', inserted)
      setStep2Error('')
      return true
    } catch (err) {
      console.error('[Onboarding Step 2] Unexpected error:', err)
      setStep2Error(t('onboarding.save_failed', { error: err?.message || '' }))
      return false
    }
  }

  const handleNext = async () => {
    if (saving) return

    if (step === 1) {
      if (!user?.id) {
        alert(t('onboarding.error_no_user'))
        return
      }

      setSaving(true)
      const { data: updateData, error } = await supabase
        .from('profiles')
        .update({ name: data.name.trim() })
        .eq('user_id', user.id)
        .select()
      setSaving(false)

      if (error) {
        console.error('[Onboarding Step 1] Supabase error:', error)
        alert(t('onboarding.save_failed', { error: error.message }))
        return
      }

      if (!updateData || updateData.length === 0) {
        console.error('[Onboarding Step 1] Update returned 0 rows — check RLS or user_id mismatch')
        alert(t('onboarding.save_failed', { error: '0 rows updated' }))
        return
      }
    }

    if (step === 2) {
      setSaving(true)
      const ok = await saveChildren()
      setSaving(false)
      if (!ok) return
    }

    if (step === 3) {
      if (!user?.id) {
        setStep3Error(t('onboarding.error_no_user'))
        return
      }

      const selectedKeys = data.modules

      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .update({ dashboard_config: { modules: selectedKeys } })
        .eq('user_id', user.id)
      setSaving(false)

      if (error) {
        console.error('[Onboarding Step 3] Supabase error:', error)
        setStep3Error(t('onboarding.save_failed', { error: error.message }))
        return
      }

      setStep3Error('')
    }

    if (step === 4) {
      if (!user?.id) {
        setStep4Error(t('onboarding.error_no_user'))
        return
      }

      const a = data.assistant || {}
      const payload = {
        assistant_name: (a.name || '').trim() || defaultAssistant.name,
        assistant_tone: TONE_KEYS.includes(a.tone) ? a.tone : defaultAssistant.tone,
        morning_digest_time: normalizeTime(a.morningTime, defaultAssistant.morningTime),
        evening_digest_time: normalizeTime(a.eveningTime, defaultAssistant.eveningTime),
      }

      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('user_id', user.id)
      setSaving(false)

      if (error) {
        console.error('[Onboarding Step 4] Supabase error:', error)
        setStep4Error(t('onboarding.save_failed', { error: error.message }))
        return
      }

      setStep4Error('')
    }

    setStep(step + 1)
  }

  const handleSkipChildren = async () => {
    if (saving) return
    setSaving(true)
    const ok = await saveChildren([])
    setSaving(false)
    if (!ok) return
    setData({ ...data, children: [] })
    setStep(3)
  }

  const handleBack = () => {
    setStep(Math.max(1, step - 1))
  }

  const canGoNext = () => {
    if (saving) return false
    if (step === 1) return data.name.trim().length >= 2
    if (step === 3) return data.modules.length >= 1
    return true
  }

  const renderStep = () => {
    if (step === 1) {
      return (
        <Step1Name
          value={data.name}
          onChange={(name) => setData({ ...data, name })}
        />
      )
    }

    if (step === 2) {
      return (
        <div>
          <Step2Children
            value={data.children}
            onChange={(children) => {
              setData({ ...data, children })
              if (step2Error) setStep2Error('')
            }}
          />
          {step2Error && (
            <p className="font-sans text-sm text-accent text-center mt-4 max-w-md mx-auto">{step2Error}</p>
          )}
          <div className="w-full max-w-md mx-auto mt-6 text-center">
            <button
              type="button"
              onClick={handleSkipChildren}
              disabled={saving}
              className="font-sans text-sm text-ink-muted hover:text-ink-soft transition-colors disabled:opacity-50"
            >
              {t('common.skip')}
            </button>
          </div>
        </div>
      )
    }

    if (step === 3) {
      return (
        <Step3Modules
          value={data.modules}
          onChange={(modules) => {
            setData({ ...data, modules })
            if (step3Error) setStep3Error('')
          }}
          error={step3Error}
        />
      )
    }

    if (step === 4) {
      return (
        <div>
          <Step4Assistant
            value={data.assistant}
            onChange={(assistant) => {
              setData({ ...data, assistant })
              if (step4Error) setStep4Error('')
            }}
          />
          {step4Error && (
            <p className="font-sans text-sm text-accent text-center mt-4 max-w-md mx-auto">{step4Error}</p>
          )}
        </div>
      )
    }

    if (step === 5) {
      return <Step5Preparing onDone={() => setStep(6)} delay={2500} />
    }

    if (step === 6) {
      return (
        <div>
          <Step6Finish onStart={handleFinish} loading={finishing} />
          {step6Error && (
            <p className="font-sans text-sm text-accent text-center mt-4 max-w-md mx-auto">{step6Error}</p>
          )}
        </div>
      )
    }

    return null
  }

  const showFooter = step >= 1 && step <= 4
  const backHandler = step > 1 && step < 5 ? handleBack : undefined
  const nextHandler = step <= 4 ? handleNext : undefined

  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      onBack={backHandler}
      onNext={showFooter ? nextHandler : undefined}
      canGoNext={canGoNext()}
      nextLabel={t('common.next')}
      backLabel={t('common.back')}
    >
      {renderStep()}
    </OnboardingLayout>
  )
}
