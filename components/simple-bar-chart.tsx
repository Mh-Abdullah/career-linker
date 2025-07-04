import * as React from "react"

export interface SimpleBarChartProps {
  data: { label: string; value: number; color: string }[]
}

export function SimpleBarChart({ data }: SimpleBarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
      {/* Y-axis label */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 8, height: 180, justifyContent: 'center' }}>
        <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 14, color: '#2B2D42', fontWeight: 600 }}>Count</span>
      </div>
      {/* Chart */}
      <div style={{ width: 240, height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: '#fff', border: '2px solid #a21caf', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 8 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 24,
                height: `${Math.round((d.value / max) * 100)}%`,
                background: d.color,
                borderRadius: 6,
                transition: 'height 0.4s',
                marginBottom: 4
              }} />
              <span style={{ fontSize: 12, color: '#2B2D42', fontWeight: 500 }}>{d.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: '#2B2D42', fontWeight: 500 }}>{d.label}</span>
            </div>
          ))}
        </div>
        {/* X-axis label */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 14, color: '#2B2D42', fontWeight: 600 }}>Status</span>
        </div>
      </div>
    </div>
  )
}
