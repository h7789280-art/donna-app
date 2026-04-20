import { useTranslation } from 'react-i18next'

export default function Step1Name({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <h1 className="font-serif italic text-4xl text-accent mb-3">{t('onboarding.step1_title')}</h1>
      <p className="font-sans text-sm text-ink-muted mb-10">
        {t('onboarding.step1_subtitle')}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('onboarding.step1_placeholder')}
        autoFocus
        maxLength={50}
        className="w-full bg-card border border-line rounded-2xl px-5 py-4 text-ink font-sans text-lg text-center placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
