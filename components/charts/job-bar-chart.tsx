"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

interface JobBarChartProps {
  data: Array<{
    date: string
    jobsPosted: number
    applications: number
  }>
}

export default function JobBarChart({ data }: JobBarChartProps) {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
            Day {label} - {data.displayDate}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-purple-600 text-sm">Jobs Posted</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">{data.jobsPosted}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-500 text-sm">Applications</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">{data.applications}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-500 text-sm">Net</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">{data.applications - data.jobsPosted}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Process data for display
  const processedData = data.map((item) => ({
    ...item,
    day: new Date(item.date).getDate().toString().padStart(2, "0"),
    displayDate: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }))

  // Calculate totals
  const totalJobsPosted = data.reduce((sum, item) => sum + item.jobsPosted, 0)
  const totalApplications = data.reduce((sum, item) => sum + item.applications, 0)
  const balance = totalApplications - totalJobsPosted

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center justify-end gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-foreground dark:text-white">Applications</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
          <span className="text-sm text-foreground dark:text-white">Jobs Posted</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white dark:bg-[#182828] rounded-lg shadow p-4 relative">
        <div className="min-h-[400px] w-full">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={processedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
              barCategoryGap="20%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-600"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, 'dataMax + 1']}
                tick={{ fill: "currentColor", fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="applications" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={20} />
              <Bar dataKey="jobsPosted" fill="#9333ea" radius={[2, 2, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats Overlay */}
        <div className="absolute top-6 right-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-w-[200px] shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-purple-600 text-sm">Jobs Posted</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">{totalJobsPosted}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-500 text-sm">Applications</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">{totalApplications}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-500 text-sm">Net Balance</span>
              </div>
              <span className={`font-medium ${balance >= 0 ? "text-green-500" : "text-purple-600"}`}>
                {balance >= 0 ? "+" : ""}
                {balance}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
