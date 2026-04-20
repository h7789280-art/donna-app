import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from './OnboardingLayout'
import Step1Name from './Step1Name'
import Step2Children from './Step2Children'
import Step3Modules from './Step3Modules'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const TOTAL_STEPS = 6

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [step3Error, setStep3Error] = useState('')
  const [data, setData] = useState({
    name: '',
    children: [],
    modules: [],
    assistant: {},
  })

  const handleFinish = () => {
    console.log('Finish:', data)
    navigate('/')
  }

  const saveChildren = async () => {
    if (!user?.id) {
      console.error('[Onboarding Step 2] No user.id — cannot insert children')
      alert('Ошибка: не найден пользователь. Перезайди, пожалуйста.')
      return false
    }

    if (data.children.length === 0) {
      console.log('[Onboarding Step 2] No children to insert — skipping')
      return true
    }

    const rows = data.children.map((c, idx) => ({
      user_id: user.id,
      name: c.name,
      birth_date: c.birth_date,
      sort_order: idx,
    }))

    console.log('[Onboarding Step 2] Inserting children:', rows)

    try {
      const { data: inserted, error } = await supabase
        .from('children')
        .insert(rows)
        .select()

      if (error) {
        console.error('[Onboarding Step 2] Supabase error:', error)
        alert('Не удалось сохранить детей: ' + error.message)
        return false
      }

      console.log('[Onboarding Step 2] Insert success:', inserted)
      return true
    } catch (err) {
      console.error('[Onboarding Step 2] Unexpected error:', err)
      alert('Ошибка при сохранении: ' + (err?.message || 'неизвестная'))
      return false
    }
  }

  const handleNext = async () => {
    if (saving) return

    if (step === 1) {
      console.log('[Onboarding Step 1] User:', user)
      console.log('[Onboarding Step 1] Name to save:', data.name.trim())

      if (!user?.id) {
        console.error('[Onboarding Step 1] No user.id — cannot update profile')
        alert('Ошибка: не найден пользователь. Перезайди, пожалуйста.')
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
        alert('Не удалось сохранить имя: ' + error.message)
        return
      }

      console.log('[Onboarding Step 1] Update success:', updateData)

      if (!updateData || updateData.length === 0) {
        console.error('[Onboarding Step 1] Update returned 0 rows — check RLS or user_id mismatch')
        alert('Имя не было сохранено (0 строк обновлено). Проверь консоль.')
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
        console.error('[Onboarding Step 3] No user.id — cannot update profile')
        setStep3Error('Ошибка: не найден пользователь. Перезайди, пожалуйста.')
        return
      }

      const selectedKeys = data.modules
      console.log('[Onboarding Step 3] saving modules:', selectedKeys)

      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .update({ dashboard_config: { modules: selectedKeys } })
        .eq('user_id', user.id)
      setSaving(false)

      if (error) {
        console.error('[Onboarding Step 3] Supabase error:', error)
        setStep3Error('Не удалось сохранить: ' + error.message)
        return
      }

      setStep3Error('')
    }

    if (step === TOTAL_STEPS) {
      handleFinish()
      return
    }
    setStep(step + 1)
  }

  const handleSkipChildren = () => {
    console.log('[Onboarding Step 2] Skip pressed — not inserting, moving to step 3')
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
            onChange={(children) => setData({ ...data, children })}
          />
          <div className="w-full max-w-md mx-auto mt-6 text-center">
            <button
              type="button"
              onClick={handleSkipChildren}
              className="font-sans text-sm text-ink-muted hover:text-ink-soft transition-colors"
            >
              Пропустить
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

    return (
      <div className="text-center">
        <h1 className="font-serif italic text-3xl text-accent">Шаг {step}</h1>
        <p className="text-ink-muted font-sans mt-2">Скоро будет</p>
      </div>
    )
  }

  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      onBack={step > 1 ? handleBack : undefined}
      onNext={handleNext}
      canGoNext={canGoNext()}
      nextLabel={step === TOTAL_STEPS ? 'Готово' : 'Далее'}
    >
      {renderStep()}
    </OnboardingLayout>
  )
}
