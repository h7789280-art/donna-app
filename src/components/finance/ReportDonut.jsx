import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatMoney } from '../../lib/currencies'

// Muted palette drawn from the design tokens (accent + decor + status colours).
// SVG fill accepts CSS var() references, so the donut follows the active theme.
export const REPORT_PALETTE = [
  'var(--accent)',
  'var(--decor-rose)',
  'var(--decor-taupe)',
  'var(--success)',
  'var(--warning)',
  'var(--error)',
  'var(--decor-rose-soft)',
]

// colorFor(index) — cycle the palette so any number of segments gets a colour.
export function colorFor(i) {
  return REPORT_PALETTE[i % REPORT_PALETTE.length]
}

// Donut chart over segments [{ name, value, color }] with the period total
// rendered in the hole (serif, in the currency's own formatting).
export default function ReportDonut({ segments, total, currencyCode }) {
  const data = (segments || []).filter((s) => Number(s.value) > 0)

  return (
    <div className="relative w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={data.length > 1 ? 2 : 0}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((s, i) => (
              <Cell key={s.name ?? i} fill={s.color || colorFor(i)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Total in the hole */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-serif text-2xl text-ink text-center px-6">
          {formatMoney(total, currencyCode)}
        </span>
      </div>
    </div>
  )
}
