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
    if (step === 1 && user) {
      const { error } = await supabase
        .from('profiles')
        .update({ name: data.name.trim() })
        .eq('user_id', user.id)
      if (error) console.error('Failed to save name:', error)
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
