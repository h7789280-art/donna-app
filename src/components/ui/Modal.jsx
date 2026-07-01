import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-gutter"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/40" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-[430px] bg-card border border-line rounded-2xl shadow-card p-gutter ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          {title && <h2 className="font-serif italic text-xl text-ink">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 -mr-1 -mt-1 h-8 w-8 inline-flex items-center justify-center rounded-pill text-ink-muted hover:bg-card-alt hover:text-ink transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="text-ink">{children}</div>
      </div>
    </div>
  )
}
