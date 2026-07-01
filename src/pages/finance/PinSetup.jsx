import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFinancePin } from '../../hooks/useFinancePin'
import PinPad from '../../components/finance/PinPad'
import Toast from '../../components/ui/Toast'

// First-time PIN setup: enter a 4-digit PIN, then confirm it.
export default function PinSetup() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setPin } = useFinancePin()

  const [stage, setStage] = useState('create') // 'create' | 'confirm'
  const [firstPin, setFirstPin] = useState('')
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const reset = () => {
    setStage('create')
    setFirstPin('')
    setValue('')
  }

  const handleComplete = async (pin) => {
    if (saving) return

    if (stage === 'create') {
      setFirstPin(pin)
      setValue('')
      setStage('confirm')
      return
    }

    // confirm stage
    if (pin !== firstPin) {
      setToast({ message: t('finance.pin.mismatch'), type: 'error' })
      reset()
      return
    }

    setSaving(true)
    const { ok } = await setPin(pin)
    setSaving(false)

    if (!ok) {
      setToast({ message: t('finance.pin.save_error'), type: 'error' })
      reset()
      return
    }
    navigate('/finance', { replace: true })
  }

  const title = stage === 'create' ? t('finance.pin.setup_title') : t('finance.pin.confirm_title')
  const subtitle =
    stage === 'create' ? t('finance.pin.setup_subtitle') : t('finance.pin.confirm_subtitle')

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-16 pb-10 flex flex-col items-center">
        <h1 className="font-serif italic text-3xl text-ink text-center mb-2">{title}</h1>
        <p className="font-sans text-md text-ink-soft text-center mb-12">{subtitle}</p>

        <PinPad value={value} onChange={setValue} onComplete={handleComplete} />

        <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
      </div>
    </div>
  )
}
