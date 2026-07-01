const VARIANTS = {
  primary: 'bg-accent text-accent-ink border border-transparent hover:opacity-90',
  secondary: 'bg-card text-ink border border-line hover:bg-card-alt',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-card-alt',
}

export default function Button({
  variant = 'primary',
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-sans text-md font-medium transition-colors ${VARIANTS[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
