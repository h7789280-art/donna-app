export const TONES = [
  { key: 'sassy', icon: '💅', titleKey: 'onboarding.tone_sassy_label', descKey: 'onboarding.tone_sassy_sublabel' },
  { key: 'warm', icon: '🤗', titleKey: 'onboarding.tone_warm_label', descKey: 'onboarding.tone_warm_sublabel' },
  { key: 'neutral', icon: '🎯', titleKey: 'onboarding.tone_neutral_label', descKey: 'onboarding.tone_neutral_sublabel' },
]

export const TONE_KEYS = TONES.map((t) => t.key)
export const DEFAULT_TONE = 'warm'
