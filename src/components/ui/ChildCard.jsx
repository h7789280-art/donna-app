import { useTranslation } from 'react-i18next'

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

export default function ChildCard({ child }) {
  const { t } = useTranslation()
  const years = calcAge(child.birth_date)
  const initial = (child.name || '?').slice(0, 1).toUpperCase()

  return (
    <div className="bg-card border border-line rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-card min-w-[160px]">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-accent font-serif italic text-lg shrink-0"
        style={{
          background:
            'linear-gradient(145deg, var(--decor-rose-soft), var(--decor-taupe))',
        }}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-serif text-ink text-lg truncate leading-tight">
          {child.name}
        </div>
        {years != null && (
          <div className="font-sans text-xs text-ink-muted mt-0.5">
            {t('dashboard.years_old', { count: years })}
          </div>
        )}
      </div>
    </div>
  )
}
