import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useFinancePin } from '../../hooks/useFinancePin'
import PinPad from '../../components/finance/PinPad'
import Toast from '../../components/ui/Toast'

// Unlock screen shown when a PIN is already set but the session is locked.
export default function PinEnter() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { verifyPin } = useFinancePin()

  const [value, setValue] = useState('')
  const [checking, setChecking] = useState(false)
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState(null)

  const handleComplete = async (pin) => {
    if (checking) return
    setChecking(true)
    const ok = await verifyPin(pin)
    setChecking(false)

    if (ok) {
      navigate('/finance', { replace: true })
      return
    }

    setToast({ message: t('finance.pin.wrong'), type: 'error' })
    setValue('')
    setShake(true)
    setTimeout(() => setShake(false), 420)
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-16 pb-10 flex flex-col items-center">
        <h1 className="font-serif italic text-3xl text-ink text-center mb-2">
          {t('finance.pin.enter_title')}
        </h1>
        <p className="font-sans text-md text-ink-soft text-center mb-12">
          {t('finance.pin.enter_subtitle')}
        </p>

        <motion.div animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }} transition={{ duration: 0.42 }}>
          <PinPad value={value} onChange={setValue} onComplete={handleComplete} />
        </motion.div>

        <p className="mt-10 font-sans text-base text-ink-muted text-center">
          {t('finance.pin.forgot')}
        </p>

        <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
      </div>
    </div>
  )
}
