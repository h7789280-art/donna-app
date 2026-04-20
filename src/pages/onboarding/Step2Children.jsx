import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function calcAge(birthDate) {
  if (!birthDate) return null
  const today = new Date()
  const b = new Date(birthDate)
  if (Number.isNaN(b.getTime())) return null
  let years = today.getFullYear() - b.getFullYear()
  const m = today.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) years -= 1
  if (years < 0) return null
  return years
}

function ageLabel(years) {
  if (years == null) return ''
  const mod10 = years % 10
  const mod100 = years % 100
  if (mod10 === 1 && mod100 !== 11) return `${years} год`
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${years} года`
  return `${years} лет`
}

export default function Step2Children({ value = [], onChange }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')

  const resetForm = () => {
    setName('')
    setBirth('')
    setAdding(false)
  }

  const handleSave = () => {
    const trimmed = name.trim()
    if (trimmed.length < 1 || !birth) return
    onChange([...value, { name: trimmed, birth_date: birth }])
    resetForm()
  }

  const handleRemove = (idx) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  const canSave = name.trim().length >= 1 && !!birth
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center">
        <h1 className="font-serif italic text-4xl text-accent mb-3">Расскажи про детей</h1>
        <p className="font-sans text-sm text-ink-muted mb-8">
          По желанию — можешь пропустить этот шаг
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {value.map((child, idx) => {
            const years = calcAge(child.birth_date)
            return (
              <motion.div
                key={`${child.name}-${child.birth_date}-${idx}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-line rounded-2xl px-5 py-4 flex items-center gap-3 shadow-card"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--decor-rose-soft)] flex items-center justify-center text-accent font-serif italic text-lg shrink-0">
                  {child.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-ink text-md truncate">{child.name}</div>
                  {years != null && (
                    <div className="font-sans text-xs text-ink-muted mt-0.5">{ageLabel(years)}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  aria-label="Удалить"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-accent hover:bg-canvas-soft transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 4h10M6.5 4V3a1 1 0 011-1h1a1 1 0 011 1v1M5 4l.5 9a1 1 0 001 1h3a1 1 0 001-1l.5-9"
                      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {adding ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-line rounded-2xl p-4 flex flex-col gap-3 shadow-card">
                <div>
                  <label className="font-mono text-xs uppercase tracking-label text-ink-muted block mb-2">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Имя ребёнка"
                    autoFocus
                    maxLength={50}
                    className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-ink font-sans text-md placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-label text-ink-muted block mb-2">
                    Дата рождения
                  </label>
                  <input
                    type="date"
                    value={birth}
                    max={today}
                    onChange={(e) => setBirth(e.target.value)}
                    className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-ink font-sans text-md placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2.5 rounded-full border border-line text-ink-soft font-sans text-sm hover:bg-canvas-soft transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className={`flex-1 py-2.5 rounded-full bg-accent text-accent-ink font-sans text-sm transition-opacity ${
                      !canSave ? 'opacity-50' : ''
                    }`}
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="add"
              type="button"
              onClick={() => setAdding(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full rounded-2xl border border-dashed border-line-strong px-5 py-4 flex items-center justify-center gap-2 text-ink-soft font-sans text-sm hover:border-accent hover:text-accent transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Добавить ребёнка
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
