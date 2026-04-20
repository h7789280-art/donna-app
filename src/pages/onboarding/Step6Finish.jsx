import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function Step6Finish({ onStart, loading = false }) {
  const { t } = useTranslation()

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-5xl mb-6 select-none"
        aria-hidden
      >
        ✨
      </motion.div>
      <h1 className="font-serif italic text-4xl text-accent mb-3">
        {t('onboarding.step6_title')}
      </h1>
      <p className="font-sans text-sm text-ink-muted mb-10">
        {t('onboarding.step6_subtitle')}
      </p>
      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="w-full max-w-xs bg-accent text-accent-ink rounded-full py-3 font-sans font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('common.loading') : t('onboarding.step6_start')}
      </button>
    </div>
  )
}
