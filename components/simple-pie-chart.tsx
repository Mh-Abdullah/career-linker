import * as React from "react"

export interface SimplePieChartProps {
  data: { label: string; value: number; color: string }[]
}

export function SimplePieChart({ data }: SimplePieChartProps) {
  // Calculate total
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let cumulative = 0
  // Pie chart arcs
  const arcs =
    total > 0
      ? data.map((d, i) => {
          const startAngle = (cumulative / total) * 2 * Math.PI
          cumulative += d.value
          const endAngle = (cumulative / total) * 2 * Math.PI
          const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
          const x1 = 50 + 40 * Math.cos(startAngle - Math.PI / 2)
          const y1 = 50 + 40 * Math.sin(startAngle - Math.PI / 2)
          const x2 = 50 + 40 * Math.cos(endAngle - Math.PI / 2)
          const y2 = 50 + 40 * Math.sin(endAngle - Math.PI / 2)
          const path = `M50,50 L${x1},${y1} A40,40 0 ${largeArc} 1 ${x2},${y2} Z`
          return <path key={i} d={path} fill={d.color} />
        })
      : null
  return (
    <svg
      viewBox="0 0 100 100"
      width={180}
      height={180}
      style={{
        border: "2px solid #00A8A8",
        background: "#fff",
      }}
    >
      {total > 0 ? (
        <>
          {arcs}
          <circle cx="50" cy="50" r="25" fill="#fff" />
          {/* Removed the 'Pie Chart' text from the center */}
        </>
      ) : (
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fill="#f87171"
          fontSize="14"
          fontWeight="bold"
        >
          No Data
        </text>
      )}
    </svg>
  )
}
