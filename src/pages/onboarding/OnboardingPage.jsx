import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from './OnboardingLayout'
import Step1Name from './Step1Name'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const TOTAL_STEPS = 6

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
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

  const handleNext = async () => {
    if (step === 1) {
      console.log('[Onboarding Step 1] User:', user)
      console.log('[Onboarding Step 1] Name to save:', data.name.trim())

      if (!user?.id) {
        console.error('[Onboarding Step 1] No user.id — cannot update profile')
        alert('Ошибка: не найден пользователь. Перезайди, пожалуйста.')
        return
      }

      const { data: updateData, error } = await supabase
        .from('profiles')
        .update({ name: data.name.trim() })
        .eq('user_id', user.id)
        .select()

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

    if (step === TOTAL_STEPS) {
      handleFinish()
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(Math.max(1, step - 1))
  }

  const canGoNext = step !== 1 || data.name.trim().length >= 2

  const renderStep = () => {
    if (step === 1) {
      return (
        <Step1Name
          value={data.name}
          onChange={(name) => setData({ ...data, name })}
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
      canGoNext={canGoNext}
      nextLabel={step === TOTAL_STEPS ? 'Готово' : 'Далее'}
    >
      {renderStep()}
    </OnboardingLayout>
  )
}
