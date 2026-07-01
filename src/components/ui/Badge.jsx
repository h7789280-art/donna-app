const VARIANTS = {
  accent: 'bg-accent text-accent-ink',
  neutral: 'bg-card-alt text-ink-soft',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
}

export default function Badge({ variant = 'neutral', children, className = '', ...rest }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-0.5 font-mono text-xs uppercase tracking-label ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  )
}
