import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function OnboardingLayout({
  currentStep,
  totalSteps = 6,
  onBack,
  onNext,
  canGoNext = true,
  nextLabel,
  backLabel,
  children,
}) {
  const { t } = useTranslation()
  const resolvedNextLabel = nextLabel ?? t('common.next')
  const resolvedBackLabel = backLabel ?? t('common.back')

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <div className="px-6 pt-8 pb-4">
        <div className="flex gap-[6px]">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full ${
                i < currentStep ? 'bg-accent' : 'bg-line'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {(onBack || onNext) && (
        <div className="px-6 pb-8 flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-full border border-line text-ink font-sans text-sm"
            >
              {resolvedBackLabel}
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              disabled={!canGoNext}
              className={`flex-1 py-3 rounded-full bg-accent text-accent-ink font-sans text-sm ${
                !canGoNext ? 'opacity-50' : ''
              }`}
            >
              {resolvedNextLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
