import React, { useState, useRef } from "react"

interface BarGraphProps {
  jobs: Array<{
    id: string
    title: string
    _count: { applications: number }
  }>
}

const MIN_ZOOM = 1
const MAX_ZOOM = 4

const BarGraph: React.FC<BarGraphProps> = ({ jobs }) => {
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  if (!jobs || jobs.length === 0) {
    return <div className="text-center text-muted-foreground">No data to display</div>
  }

  const maxApplications = Math.max(...jobs.map((job) => job._count.applications), 1)

  // Handle wheel scroll for horizontal scrolling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (containerRef.current && e.deltaY !== 0) {
      containerRef.current.scrollLeft += e.deltaY
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-2 gap-2">
        <button
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs font-semibold"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.5))}
          disabled={zoom <= MIN_ZOOM}
        >
          -
        </button>
        <button
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs font-semibold"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.5))}
          disabled={zoom >= MAX_ZOOM}
        >
          +
        </button>
      </div>
      <div
        ref={containerRef}
        className="flex items-end h-full w-full gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ cursor: 'grab' }}
        onWheel={handleWheel}
      >
        {jobs.map((job) => (
          <div key={job.id} className="flex flex-col items-center" style={{ minWidth: `${32 * zoom}px`, width: `${60 * zoom}px` }}>
            <div
              className="bg-purple-600 dark:bg-[#00FFD0] rounded-t-md transition-all shadow-lg ring-2 ring-purple-600 dark:ring-[#00FFD0]"
              style={{
                height: `${(job._count.applications / maxApplications) * 180 + 30}px`,
                width: '100%'
              }}
              title={`${job.title}: ${job._count.applications} applications`}
            ></div>
            <span className="mt-2 text-xs text-center text-foreground dark:text-[#00FFD0] truncate w-20" title={job.title}>
              {job.title.length > 12 ? job.title.slice(0, 12) + '…' : job.title}
            </span>
            <span className="text-xs text-muted-foreground font-bold">{job._count.applications}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BarGraph
