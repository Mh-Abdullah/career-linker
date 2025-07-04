"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import DashboardView from "./dashboard-view"
import JobsView from "./jobs-view"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

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
  interface SessionUser {
    id: string
    email: string
    name: string
    userType: string
    image?: string
  }

  interface CustomSession {
    user: SessionUser
  }

  const { data: session, status } = useSession() as { data: CustomSession | null, status: string }
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

    if (jobs.length === 0 && document.visibilityState === "visible") {
      fetchJobs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-background text-foreground transition-colors">
      {/* Navigation */}
      <nav className="bg-white dark:bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => router.push("/dashboard/job-provider")}>
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">CL</span>
            </div>
            <span className="text-xl font-semibold text-purple-600">CareerLinker</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setCurrentView("dashboard")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === "dashboard"
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-white dark:bg-card text-[#2B2D42] dark:text-white border border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-muted"
                }`}
              >
                Dashboard
              </Button>
              <Button
                onClick={() => setCurrentView("jobs")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === "jobs"
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-white dark:bg-card text-[#2B2D42] dark:text-white border border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-muted"
                }`}
              >
                Manage Jobs
              </Button>
            </div>

            <ThemeToggle />

            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-foreground">{session.user.name}</span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-48 mt-2">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    const confirmed = confirm("Are you sure you want to delete your account?")
                    if (confirmed) {
                      try {
                        const res = await fetch("/api/auth/delete-account", { method: "DELETE" })
                        if (res.ok) {
                          alert("Your account has been deleted.")
                          signOut({ callbackUrl: "/" })
                        } else {
                          const data = await res.json()
                          alert(data.error || "Failed to delete account.")
                        }
                      } catch {
                        alert("Network error. Please try again.")
                      }
                    }
                  }}
                  className="text-red-600"
                >
                  Delete Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-[#2B2D42]/60 dark:text-white/60 text-lg">Loading jobs...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <Button onClick={fetchJobs} className="bg-purple-600 hover:bg-purple-700 text-white">
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {currentView === "dashboard" && (
              <DashboardView
                jobs={jobs}
                onJobCreated={fetchJobs}
                onManageJobs={() => setCurrentView("jobs")}
              />
            )}
            {currentView === "jobs" && (
              <JobsView
                jobs={jobs}
                onJobCreated={fetchJobs}
                onJobUpdated={fetchJobs}
              />
            )}
          </>
        )}
      </div>

      {/* <ChangePasswordDialog open={showChangePassword} onClose={() => setShowChangePassword(false)} /> */}
    </div>
  )
}
