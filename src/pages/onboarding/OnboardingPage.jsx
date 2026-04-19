import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from './OnboardingLayout'

const TOTAL_STEPS = 6

export default function OnboardingPage() {
  const navigate = useNavigate()
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

  const handleNext = () => {
    if (step === TOTAL_STEPS) {
      handleFinish()
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(Math.max(1, step - 1))
  }

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="text-center">
          <h1 className="font-serif italic text-3xl text-accent mb-4">
            Как тебя зовут?
          </h1>
          <p className="text-ink-muted font-sans">Шаг 1 — скоро будет форма</p>
        </div>
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
      canGoNext={true}
      nextLabel={step === TOTAL_STEPS ? 'Готово' : 'Далее'}
    >
      {renderStep()}
    </OnboardingLayout>
  )
}
