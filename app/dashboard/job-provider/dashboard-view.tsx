"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Plus, Users, Eye, Calendar, TrendingUp, Briefcase } from "lucide-react"
import CreateJobModal from "./create-job-modal"
import { signOut } from "next-auth/react"

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
  onManageJobs: () => void // Add this prop
}

export default function DashboardView({ jobs, onJobCreated, onManageJobs }: DashboardViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)

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
          <h1 className="text-3xl font-bold text-[#2B2D42] dark:text-[#009494] mb-2">Dashboard Overview</h1>
          <p className="text-[#2B2D42]/70 dark:text-white">Track your job postings and recruitment metrics</p>
        </div>
        <Button onClick={handleCreateJob} className="bg-[#00A8A8] hover:bg-[#009494] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
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
            <div className="w-12 h-12 bg-[#00A8A8]/10 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-[#00A8A8]" />
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
              <Button onClick={handleCreateJob} className="mt-4 bg-[#00A8A8] hover:bg-[#009494] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-[#2B2D42]">{job.title}</h3>
                    <p className="text-sm text-[#2B2D42]/70">{job.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#00A8A8]">{job._count.applications} applications</p>
                    <p className="text-xs text-[#2B2D42]/60">{new Date(job.createdAt).toLocaleDateString()}</p>
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
            <div className="space-y-4">
              {jobs
                .sort((a, b) => b._count.applications - a._count.applications)
                .slice(0, 3)
                .map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-[#2B2D42]">{job.title}</h3>
                      <p className="text-sm text-[#2B2D42]/70">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#00A8A8]">{job._count.applications} applications</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          job.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
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

      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border p-6 text-foreground transition-colors">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <Button
            onClick={handleCreateJob}
            className="h-20 bg-[#00A8A8] hover:bg-[#009494] text-white flex flex-col items-center justify-center"
          >
            <Plus className="h-6 w-6 mb-2" />
            Post New Job
          </Button>
          <Button
            onClick={onManageJobs}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-[#00A8A8] text-[#00A8A8] hover:bg-[#00A8A8] hover:text-white"
          >
            <Eye className="h-6 w-6 mb-2" />
            Manage Jobs
          </Button>
        </div>
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
