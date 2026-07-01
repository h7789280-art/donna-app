import Card from './Card'
import WidgetHeader from './WidgetHeader'

export default function StatCard({ label, value, hint, icon, className = '', ...rest }) {
  return (
    <Card className={`p-gutter ${className}`} {...rest}>
      <div className="flex items-start justify-between gap-3">
        {label && <WidgetHeader>{label}</WidgetHeader>}
        {icon && <span className="text-ink-muted shrink-0">{icon}</span>}
      </div>
      <div className="mt-2 font-serif text-2xl text-ink leading-none">{value}</div>
      {hint && <div className="mt-1.5 font-sans text-sm text-ink-muted">{hint}</div>}
    </Card>
  )
}
