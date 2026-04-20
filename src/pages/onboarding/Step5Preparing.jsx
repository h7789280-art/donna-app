import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function Step5Preparing({ onDone, delay = 2500 }) {
  const { t } = useTranslation()

  useEffect(() => {
    const id = setTimeout(() => onDone?.(), delay)
    return () => clearTimeout(id)
  }, [onDone, delay])

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="flex flex-col items-center gap-6">
        <div
          className="w-12 h-12 rounded-full border-4 border-line border-t-accent animate-spin"
          aria-hidden
        />
        <div>
          <h1 className="font-serif italic text-3xl text-accent mb-2">
            {t('onboarding.step5_title')}
          </h1>
          <p className="font-sans text-sm text-ink-muted">
            {t('onboarding.step5_subtitle')}
          </p>
        </div>
      </div>
    </div>
  )
}
