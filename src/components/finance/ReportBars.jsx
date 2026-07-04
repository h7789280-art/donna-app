import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'

// Simple bordeaux bar chart over [{ key, label, value }]. Axis labels are
// small ink-muted mono; bars use the accent token so the theme drives colour.
// Empty state (all zero) is handled by the caller so it can localise the copy.
export default function ReportBars({ data, height = 180 }) {
  const rows = data || []
  // Cap how many x-axis labels we draw so a month/custom range stays legible.
  const interval = rows.length > 12 ? Math.ceil(rows.length / 12) - 1 : 0

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 2, bottom: 2, left: 2 }} barCategoryGap="18%">
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--ink-muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: 'var(--line)' }}
            tickLine={false}
            interval={interval}
            minTickGap={4}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {rows.map((d) => (
              <Cell key={d.key} fill="var(--accent)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
