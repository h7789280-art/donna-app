import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// NOTE: no dedicated status colors in the token set — the left accent bar
// approximates success/error/info with the accent + decor palette.
const TYPES = {
  success: 'bg-decor-rose-soft',
  error: 'bg-accent',
  info: 'bg-decor-taupe',
}

export default function Toast({ message, type = 'info', duration = 3000, onDone }) {
  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => onDone?.(), duration)
    return () => clearTimeout(id)
  }, [message, duration, onDone])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-gutter pointer-events-none"
        >
          <div className="pointer-events-auto flex items-stretch gap-3 max-w-[430px] w-full bg-card border border-line rounded-xl shadow-card overflow-hidden">
            <span className={`w-1 shrink-0 ${TYPES[type]}`} aria-hidden="true" />
            <span className="py-3 pr-4 font-sans text-md text-ink">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
