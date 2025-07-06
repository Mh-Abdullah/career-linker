"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Plus, Search, Filter, Edit, Trash2, Users, MapPin, DollarSign } from "lucide-react"
import CreateJobModal from "./create-job-modal"
import EditJobModal from "./edit-job-modeal"
import { useRouter } from "next/navigation"

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

interface JobsViewProps {
  jobs: Job[]
  onJobCreated: () => void
  onJobUpdated: () => void
}

export default function JobsView({ jobs, onJobCreated, onJobUpdated }: JobsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const router = useRouter()

  useEffect(() => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.skills?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => {
        if (statusFilter === "active") return job.isActive
        if (statusFilter === "inactive") return !job.isActive
        return true
      })
    }

    setFilteredJobs(filtered)
  }, [searchTerm, statusFilter, jobs])

  const formatJobType = (jobType: string) =>
    jobType.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return "1 week ago"
    if (diffDays < 21) return "2 weeks ago"
    return "3+ weeks ago"
  }

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jobId, isActive: !currentStatus }),
      })

      if (response.ok) {
        onJobUpdated()
      } else {
        const errorData = await response.json()
        alert(`Failed to update job: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error updating job:", error)
      alert("Network error updating job")
    }
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to permanently delete this job?")) return

    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" })

      if (response.ok) {
        onJobUpdated()
        alert("Job deleted successfully")
      } else {
        const errorData = await response.json()
        alert(`Failed to delete job: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error deleting job:", error)
      alert("Network error deleting job")
    }
  }

  const handleCreateJob = () => setShowCreateModal(true)
  const handleJobCreated = () => {
    onJobCreated()
    setShowCreateModal(false)
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setShowEditModal(true)
  }

  const handleViewApplications = (jobId: string) => {
    router.push(`/dashboard/job-provider/applications?jobId=${jobId}`)
  }

  const handleEditModalClose = () => {
    setShowEditModal(false)
    setEditingJob(null)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2B2D42] dark:text-purple-600 mb-1">Dashboard Overview</h1>
          <p className="text-[#2B2D42]/70 dark:text-white">Track your job postings and recruitment metrics</p>
        </div>
        <Button onClick={handleCreateJob} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-card rounded-lg border border-border p-6 text-foreground">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="Search jobs by title, company, location, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-foreground dark:text-white bg-background placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-foreground bg-background"
            >
              <option value="all">All Jobs</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border text-foreground dark:text-white">
            <div className="text-muted-foreground text-lg mb-4">
              {jobs.length === 0 ? "No jobs posted yet" : "No jobs match your search criteria"}
            </div>
            {jobs.length === 0 && (
              <Button onClick={handleCreateJob} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            )}
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-colors text-foreground dark:text-white"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-[#2B2D42] dark:text-white">{job.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                      {formatJobType(job.jobType)}
                    </span>
                    {job.isRemote && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Remote
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[#2B2D42]/70 dark:text-white mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{job._count.applications} applications</span>
                    </div>
                  </div>

                  <p className="text-[#2B2D42]/70 dark:text-white mb-3 line-clamp-2">{job.description}</p>

                  {job.skills && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.split(", ").slice(0, 5).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-muted text-xs rounded-md dark:bg-muted dark:text-white">
                          {skill}
                        </span>
                      ))}
                      {job.skills.split(", ").length > 5 && (
                        <span className="px-2 py-1 bg-muted text-xs rounded-md dark:bg-muted dark:text-white">
                          +{job.skills.split(", ").length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-sm text-[#2B2D42]/60 dark:text-white">
                    Posted {getTimeAgo(job.createdAt)} • Updated {getTimeAgo(job.updatedAt)}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <Button
                    onClick={() => handleViewApplications(job.id)}
                    variant="outline"
                    size="sm"
                    className="text-purple-600 border-purple-600 hover:bg-purple-700 hover:text-white"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    View Applications ({job._count.applications})
                  </Button>
                  <Button
                    onClick={() => toggleJobStatus(job.id, job.isActive)}
                    variant="outline"
                    size="sm"
                    className={
                      job.isActive
                        ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                        : "text-green-600 border-green-200 hover:bg-green-50"
                    }
                  >
                    {job.isActive ? "Pause" : "Activate"}
                  </Button>
                  <Button
                    onClick={() => handleEditJob(job)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteJob(job.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateJobModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onJobCreated={handleJobCreated} />
      <EditJobModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        onJobUpdated={() => {
          onJobUpdated()
          handleEditModalClose()
        }}
        job={editingJob}
      />
    </div>
  )
}
