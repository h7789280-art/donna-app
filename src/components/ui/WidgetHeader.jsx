export default function WidgetHeader({ children, className = '' }) {
  return (
    <div
      className={`font-mono text-xs uppercase tracking-label text-ink-muted ${className}`}
    >
      {children}
    </div>
  )
}
