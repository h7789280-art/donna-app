import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

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

// Amount without the currency glyph, in the user's locale formatting
// (e.g. "1 250 000,00"). The currency code is rendered separately below it.
function formatAmount(amount) {
  const value = Number(amount) || 0
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Font size (px) for the amount so it never spills past the donut hole. The
// hole is ~64% of a 224px-tall donut → ~143px inner diameter; we keep the text
// inside a safe chord (~128px) and shrink the longer the number gets. Serif
// digits run ~0.5em wide, so length drives the size. Clamped 13–30px.
function amountFontSize(text) {
  const fit = Math.floor(128 / (text.length * 0.5))
  return Math.max(13, Math.min(30, fit))
}

// Donut chart over segments [{ name, value, color }] with the period total
// rendered in the hole: amount (Cormorant italic) over its currency code.
export default function ReportDonut({ segments, total, currencyCode }) {
  const data = (segments || []).filter((s) => Number(s.value) > 0)
  const amount = formatAmount(total)

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
            innerRadius="64%"
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

      {/* Total in the hole — two centred lines: amount over currency code */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
        <span
          className="font-serif italic text-ink leading-none text-center tabular-nums"
          style={{ fontSize: `${amountFontSize(amount)}px` }}
        >
          {amount}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-caps text-ink-muted leading-none">
          {currencyCode}
        </span>
      </div>
    </div>
  )
}
