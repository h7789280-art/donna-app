import { motion } from 'framer-motion'
import { MODULES } from '../../config/modules'

export default function Step3Modules({ value = [], onChange, error }) {
  const toggle = (key) => {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key))
    } else {
      onChange([...value, key])
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center">
        <h1 className="font-serif italic text-4xl text-accent mb-3">Что тебе важно?</h1>
        <p className="font-sans text-sm text-ink-muted mb-8">
          Выбери сферы, с которыми Донна будет помогать. Позже можно изменить в настройках
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MODULES.map((m) => {
          const selected = value.includes(m.key)
          return (
            <motion.button
              key={m.key}
              type="button"
              onClick={() => toggle(m.key)}
              whileTap={{ scale: 0.97 }}
              className={`relative text-left rounded-2xl px-4 py-4 shadow-card transition-colors ${
                selected
                  ? 'bg-canvas-soft border-2 border-accent'
                  : 'bg-card border border-line hover:border-line-strong'
              }`}
            >
              {selected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                  aria-hidden
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6.2l2.4 2.4L9.5 4" stroke="var(--accent-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              )}
              <div className="text-2xl mb-2 leading-none select-none" aria-hidden>{m.icon}</div>
              <div className="font-sans text-ink text-sm font-medium leading-tight">{m.title}</div>
              <div className="font-sans text-xs text-ink-muted mt-1 leading-snug">{m.description}</div>
            </motion.button>
          )
        })}
      </div>

      {error && (
        <p className="font-sans text-sm text-accent text-center mt-4">{error}</p>
      )}
    </div>
  )
}
