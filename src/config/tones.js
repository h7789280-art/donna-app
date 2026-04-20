export const TONES = [
  {
    key: 'sassy',
    icon: '💅',
    title: 'Дерзкая',
    description: 'Прямолинейная, с иронией',
  },
  {
    key: 'warm',
    icon: '🤗',
    title: 'Тёплая',
    description: 'Поддерживающая, мягкая',
  },
  {
    key: 'neutral',
    icon: '🎯',
    title: 'Нейтральная',
    description: 'По делу, без лишнего',
  },
]

export const TONE_KEYS = TONES.map((t) => t.key)
export const DEFAULT_TONE = 'warm'
