"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import DashboardView from "./dashboard-view"
import JobsView from "./jobs-view"

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

export default function JobProviderDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [currentView, setCurrentView] = useState<"dashboard" | "jobs">("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.userType !== "JOB_PROVIDER") {
      router.push("/dashboard/job-seeker")
      return
    }

    fetchJobs()
  }, [session, status, router])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/jobs")

      if (response.ok) {
        const jobsData = await response.json()
        setJobs(jobsData)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        setError(`Failed to load jobs: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-[#2B2D42]">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.userType !== "JOB_PROVIDER") {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#00A8A8] rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">CL</span>
            </div>
            <span className="text-xl font-semibold text-[#00A8A8]">CareerLinker</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1">
              <Button
                variant={currentView === "dashboard" ? "default" : "ghost"}
                onClick={() => setCurrentView("dashboard")}
                className={
                  currentView === "dashboard" ? "bg-[#00A8A8] text-white" : "text-[#2B2D42] hover:text-[#00A8A8]"
                }
              >
                Dashboard
              </Button>
              <Button
                variant={currentView === "jobs" ? "default" : "ghost"}
                onClick={() => setCurrentView("jobs")}
                className={currentView === "jobs" ? "bg-[#00A8A8] text-white" : "text-[#2B2D42] hover:text-[#00A8A8]"}
              >
                Manage Jobs
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[#2B2D42]">Welcome, {session.user.name}</span>
              <Button onClick={() => signOut()} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-[#2B2D42]/60 text-lg">Loading jobs...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <Button onClick={fetchJobs} className="bg-[#00A8A8] hover:bg-[#009494] text-white">
              Try Again
            </Button>
          </div>
        )}

        {/* Content Views */}
        {!isLoading && !error && (
          <>
            {currentView === "dashboard" && <DashboardView jobs={jobs} onJobCreated={fetchJobs} />}
            {currentView === "jobs" && <JobsView jobs={jobs} onJobCreated={fetchJobs} onJobUpdated={fetchJobs} />}
          </>
        )}
      </div>
    </div>
  )
}
