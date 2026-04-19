import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LOCALES, DEFAULT_LOCALE, setStoredLocale } from '../../lib/locales'

export default function WelcomePage() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedLocale, setSelectedLocale] = useState(DEFAULT_LOCALE)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(
      () => setCurrentIndex((i) => (i + 1) % LOCALES.length),
      1800
    )
    return () => clearInterval(id)
  }, [])

  const active = LOCALES.find((l) => l.code === selectedLocale) ?? LOCALES[0]
  const current = LOCALES[currentIndex]

  const handleContinue = () => {
    setStoredLocale(selectedLocale)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6 py-12">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="text-center h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={current.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="font-serif italic text-4xl md:text-5xl text-accent"
            >
              {current.welcome}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between bg-card border border-line rounded-xl px-4 py-3 font-sans text-ink hover:border-accent transition"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl">{active.flag}</span>
              <span>{active.name}</span>
            </span>
            <span className="text-ink-muted">▾</span>
          </button>

          {dropdownOpen && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-card border border-line rounded-xl shadow-card max-h-72 overflow-y-auto z-10">
              {LOCALES.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => {
                    setSelectedLocale(locale.code)
                    setDropdownOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left font-sans hover:bg-canvas-soft transition ${
                    selectedLocale === locale.code
                      ? 'bg-canvas-soft text-accent'
                      : 'text-ink'
                  }`}
                >
                  <span className="text-xl">{locale.flag}</span>
                  <span>{locale.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-accent text-accent-ink rounded-xl py-3 font-sans font-medium hover:opacity-90 transition"
        >
          Продолжить
        </button>
      </div>
    </div>
  )
}
