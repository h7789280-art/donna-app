// NOTE: the design system has no dedicated status colors (success/warning/error).
// Those variants approximate with the accent + decor palette (see response notes).
const VARIANTS = {
  accent: 'bg-accent text-accent-ink',
  neutral: 'bg-card-alt text-ink-soft',
  success: 'bg-decor-rose-soft text-accent',
  warning: 'bg-accent/10 text-accent',
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
