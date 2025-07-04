import React from "react"

interface DataPoint {
  date: string // ISO date string
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  label: React.ReactNode
  color?: string
}

const LineChart: React.FC<LineChartProps> = ({ data, label, color = "#a21caf" }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-muted-foreground">No data to display</div>
  }

  // SVG dimensions
  const width = 320
  const height = 120
  const padding = 32

  // X/Y scaling
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const minValue = Math.min(...data.map((d) => d.value), 0)
  const yRange = maxValue - minValue || 1
  const xStep = (width - 2 * padding) / (data.length - 1 || 1)

  // Points
  const points = data.map((d, i) => {
    const x = padding + i * xStep
    const y = height - padding - ((d.value - minValue) / yRange) * (height - 2 * padding)
    return `${x},${y}`
  })

  return (
    <div className="w-full flex flex-col items-center">
      <svg width={width} height={height} className="mb-2">
        {/* X/Y axis */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" />
        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={2}
          points={points.join(" ")}
        />
        {/* Dots */}
        {data.map((d, i) => {
          const x = padding + i * xStep
          const y = height - padding - ((d.value - minValue) / yRange) * (height - 2 * padding)
          return <circle key={i} cx={x} cy={y} r={3} fill={color} />
        })}
        {/* Labels */}
        {data.map((d, i) => {
          const x = padding + i * xStep
          const y = height - padding + 16
          return (
            <text key={i} x={x} y={y} fontSize={10} textAnchor="middle" fill="#888">
              {d.date.slice(5, 10)}
            </text>
          )
        })}
      </svg>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

export default LineChart
