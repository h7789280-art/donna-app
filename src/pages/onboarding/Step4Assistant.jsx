import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TONES } from '../../config/tones'

export default function Step4Assistant({ value, onChange }) {
  const { t } = useTranslation()
  const defaultName = t('onboarding.step4_name_placeholder')
  const { name = defaultName, tone = 'warm', morningTime = '07:30', eveningTime = '21:00' } = value || {}

  const update = (patch) => onChange({ ...value, ...patch })

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center">
        <h1 className="font-serif italic text-4xl text-accent mb-3">{t('onboarding.step4_title')}</h1>
        <p className="font-sans text-sm text-ink-muted mb-8">
          {t('onboarding.step4_subtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <label className="font-mono text-xs uppercase tracking-label text-ink-muted block mb-2">
            {t('onboarding.step4_name_label')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder={defaultName}
            maxLength={30}
            className="w-full bg-card border border-line rounded-xl px-4 py-3 text-ink font-sans text-md placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-label text-ink-muted block mb-2">
            {t('onboarding.step4_tone_label')}
          </label>
          <div className="flex flex-col gap-2.5">
            {TONES.map((tn) => {
              const selected = tone === tn.key
              return (
                <motion.button
                  key={tn.key}
                  type="button"
                  onClick={() => update({ tone: tn.key })}
                  whileTap={{ scale: 0.98 }}
                  className={`relative text-left rounded-2xl px-4 py-3 shadow-card transition-colors flex items-center gap-3 ${
                    selected
                      ? 'bg-canvas-soft border-2 border-accent'
                      : 'bg-card border border-line hover:border-line-strong'
                  }`}
                >
                  <div className="text-2xl leading-none select-none shrink-0" aria-hidden>
                    {tn.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-ink text-md font-medium leading-tight">{t(tn.titleKey)}</div>
                    <div className="font-sans text-xs text-ink-muted mt-0.5 leading-snug">{t(tn.descKey)}</div>
                  </div>
                  {selected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0"
                      aria-hidden
                    >
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.2l2.4 2.4L9.5 4" stroke="var(--accent-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-label text-ink-muted block mb-2">
            {t('onboarding.step4_digest_label')}
          </label>
          <div className="flex flex-col gap-2.5">
            <div className="bg-card border border-line rounded-xl px-4 py-3 flex items-center gap-3 shadow-card">
              <div className="text-xl leading-none select-none shrink-0" aria-hidden>🌅</div>
              <div className="flex-1 font-sans text-ink text-md">{t('onboarding.step4_morning')}</div>
              <input
                type="time"
                value={morningTime}
                onChange={(e) => update({ morningTime: e.target.value })}
                className="bg-canvas border border-line rounded-lg px-3 py-1.5 text-ink font-sans text-md focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="bg-card border border-line rounded-xl px-4 py-3 flex items-center gap-3 shadow-card">
              <div className="text-xl leading-none select-none shrink-0" aria-hidden>🌙</div>
              <div className="flex-1 font-sans text-ink text-md">{t('onboarding.step4_evening')}</div>
              <input
                type="time"
                value={eveningTime}
                onChange={(e) => update({ eveningTime: e.target.value })}
                className="bg-canvas border border-line rounded-lg px-3 py-1.5 text-ink font-sans text-md focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
