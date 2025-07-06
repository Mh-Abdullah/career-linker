"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Users, Calendar, TrendingUp, Briefcase } from "lucide-react"
import CreateJobModal from "./create-job-modal"
import JobBarChart from "@/components/charts/job-bar-chart"

interface Job {
  id: string
  title: string
  description: string
  company: string
  location: string
  salary?: string
  jobType: string
  experience?: string
  skills?: string
  isActive: boolean
  isRemote: boolean
  createdAt: string
  updatedAt: string
  _count: {
    applications: number
  }
}

interface DashboardViewProps {
  jobs: Job[]
  onJobCreated: () => void
}

export default function DashboardView({ jobs, onJobCreated }: DashboardViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 7 days ago
    end: new Date().toISOString().slice(0, 10),
  })

  // Filter jobs by date range
  const jobsInRange = jobs.filter((job) => {
    const d = job.createdAt.slice(0, 10)
    return d >= dateRange.start && d <= dateRange.end
  })

  // Aggregate jobs per day
  const getDateArray = (start: string, end: string) => {
    const arr = []
    const dt = new Date(start)
    const endDt = new Date(end)
    while (dt <= endDt) {
      arr.push(dt.toISOString().slice(0, 10))
      dt.setDate(dt.getDate() + 1)
    }
    return arr
  }

  const dateArr = getDateArray(dateRange.start, dateRange.end)

  // Combined data for the bar chart - this is the key functional part
  const chartData = dateArr.map((date) => ({
    date,
    jobsPosted: jobsInRange.filter((j) => j.createdAt.slice(0, 10) === date).length,
    applications: jobsInRange.reduce(
      (sum, j) => sum + (j.createdAt.slice(0, 10) === date ? j._count.applications : 0),
      0,
    ),
  }))

  const totalApplications = jobs.reduce((total, job) => total + job._count.applications, 0)
  const activeJobs = jobs.filter((job) => job.isActive).length
  const avgApplications = jobs.length > 0 ? Math.round(totalApplications / jobs.length) : 0

  // Recent activity (last 7 days)
  const recentJobs = jobs.filter((job) => {
    const jobDate = new Date(job.createdAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return jobDate >= weekAgo
  })

  const handleCreateJob = () => {
    setShowCreateModal(true)
  }

  const handleJobCreated = () => {
    onJobCreated()
    setShowCreateModal(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">Dashboard Overview</h1>
          <p className="text-[#2B2D42]/70 dark:text-white">Track your job postings and recruitment metrics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateJob} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6 text-foreground transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm dark:text-white">Total Jobs</p>
              <p className="text-2xl font-bold text-foreground dark:text-white">{jobs.length}</p>
              <p className="text-xs text-green-600 mt-1">+{recentJobs.length} this week</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6 text-foreground transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm dark:text-white">Active Jobs</p>
              <p className="text-2xl font-bold text-foreground dark:text-white">{activeJobs}</p>
              <p className="text-xs text-muted-foreground mt-1">{jobs.length - activeJobs} inactive</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6 text-foreground transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm dark:text-white">Total Applications</p>
              <p className="text-2xl font-bold text-foreground dark:text-white">{totalApplications}</p>
              <p className="text-xs text-blue-600 mt-1">Across all jobs</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6 text-foreground transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm dark:text-white">Avg. Applications</p>
              <p className="text-2xl font-bold text-foreground dark:text-white">{avgApplications}</p>
              <p className="text-xs text-purple-600 mt-1">Per job posting</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-card rounded-lg border border-border p-6 text-foreground transition-colors">
          <h2 className="text-xl font-semibold mb-4">Recent Job Postings</h2>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#2B2D42]/60">No jobs posted this week</p>
              <Button onClick={handleCreateJob} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-[#1A2A2A] dark:text-purple-400"
                >
                  <div>
                    <h3 className="font-medium text-[#2B2D42] dark:text-purple-400">{job.title}</h3>
                    <p className="text-sm text-white/70">{job.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-300">
                      {job._count.applications} applications
                    </p>
                    <p className="text-xs text-[#2B2D42]/60 dark:text-white/60">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Jobs */}
        <div className="bg-card rounded-lg border border-border p-6 text-foreground transition-colors">
          <h2 className="text-xl font-semibold mb-4">Top Performing Jobs</h2>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#2B2D42]/60">No jobs posted yet</p>
            </div>
          ) : (
            <div className="space-y-4 ">
              {jobs
                .sort((a, b) => b._count.applications - a._count.applications)
                .slice(0, 3)
                .map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-[#1A2A2A] dark:text-purple-400"
                  >
                    <div>
                      <h3 className="font-medium text-[#2B2D42] dark:text-purple-600">{job.title}</h3>
                      <p className="text-sm text-[#2B2D42]/70 dark:text-white/70">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-300">
                        {job._count.applications} applications
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          job.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {job.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Analysis (Bar Chart) */}
      <div className="bg-card rounded-lg border border-border p-6 text-foreground transition-colors">
        <h2 className="text-xl font-semibold mb-4">Job Posting Analytics</h2>
        <div className="flex flex-row gap-2 items-center justify-end mb-4">
          <div>
            <label className="text-sm mr-2">From:</label>
            <input
              type="date"
              value={dateRange.start}
              max={dateRange.end}
              onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
              className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm mx-2">To:</label>
            <input
              type="date"
              value={dateRange.end}
              min={dateRange.start}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
              className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <JobBarChart data={chartData} />
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onJobCreated={handleJobCreated}
      />
    </div>
  )
}
