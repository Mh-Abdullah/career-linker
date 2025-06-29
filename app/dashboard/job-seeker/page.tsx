"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import { Search, Filter, MapPin, Clock, Briefcase, RefreshCw } from "lucide-react"
import JobDetailPage from "./job-detail"
import ChangePasswordDialog from "./change-password-dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu" // adjust path if needed
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  jobType: string
  skills?: string
  description: string
  createdAt: string
  postedBy: {
    name: string
    jobProviderProfile?: {
      companyName: string
      logo?: string
    }
  }
  _count: {
    applications: number
  }
}

const jobCategories = ["All", "Web", "Mobile", "AI/ML", "UI/UX", "Backend", "Frontend", "DevOps", "Data Science"]

export default function JobSeekerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedJobType, setSelectedJobType] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [currentView, setCurrentView] = useState<"list" | "detail">("list")
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showChangePassword, setShowChangePassword] = useState(false)

  // Only fetch jobs on initial mount or after reload, not on every navigation or tab switch
  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.userType !== "JOB_SEEKER") {
      router.push("/dashboard/job-provider")
      return
    }

    // Only fetch jobs if jobs array is empty and the page is visible (not on tab switch)
    if (jobs.length === 0 && typeof document !== "undefined" && document.visibilityState === "visible") {
      fetchJobs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router])

  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, selectedJobType, selectedLocation, jobs])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/jobs/available", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const jobsData = await response.json()

        if (Array.isArray(jobsData)) {
          setJobs(jobsData)
          setError("")
        } else {
          throw new Error("Invalid response format")
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))

        if (response.status === 401) {
          setError("Authentication required. Please sign in again.")
          router.push("/auth/signin")
          return
        } else if (response.status === 403) {
          setError("Access denied. Please check your account permissions.")
        } else {
          setError(`Failed to load jobs: ${errorData.error || response.statusText}`)
        }
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setError("Network connection error. Please check your internet connection and try again.")
      } else {
        setError(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = jobs

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.postedBy.jobProviderProfile?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category (skills)
    if (selectedCategory !== "All") {
      filtered = filtered.filter((job) => job.skills?.toLowerCase().includes(selectedCategory.toLowerCase()))
    }

    // Filter by job type
    if (selectedJobType !== "All") {
      filtered = filtered.filter((job) => job.jobType === selectedJobType)
    }

    // Filter by location
    if (selectedLocation !== "All") {
      filtered = filtered.filter((job) => job.location.toLowerCase().includes(selectedLocation.toLowerCase()))
    }

    setFilteredJobs(filtered)
  }

  const handleSearch = () => {
    applyFilters()
  }

  const formatJobType = (jobType: string) => {
    return jobType
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-[#2B2D42]">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.userType !== "JOB_SEEKER") {
    return null
  }

  if (currentView === "detail") {
    return <JobDetailPage jobId={selectedJobId} onBack={() => setCurrentView("list")} />
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => router.push("/dashboard/job-seeker")}>
            <div className="w-10 h-10 bg-[#00A8A8] rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">CL</span>
            </div>
            <span className="text-xl font-semibold text-[#00A8A8]">CareerLinker</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 bg-[#00A8A8] text-white rounded-lg hover:bg-[#009494] transition-colors"
              onClick={() => router.push("/dashboard/job-seeker/applications")}
            >
              Applied
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-[#2B2D42]">{session.user.name}</span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-48 mt-2">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                  Change Password
                </DropdownMenuItem>
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
                      } catch (err) {
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
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2B2D42] mb-4">FIND YOUR DREAM JOB</h1>
          <p className="text-lg text-[#2B2D42]/70 mb-8">
            Discover your next opportunity from our curated list of job positions
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A8A8]">{jobs.length}+</div>
              <div className="text-[#2B2D42]/70">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A8A8]">
                {new Set(jobs.map((job) => job.postedBy.jobProviderProfile?.companyName || job.company)).size}+
              </div>
              <div className="text-[#2B2D42]/70">Companies Listing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A8A8]">1M+</div>
              <div className="text-[#2B2D42]/70">Active Users</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8] text-[#2B2D42]"
              />
            </div>
            <Button onClick={handleSearch} className="px-6 py-3 bg-[#00A8A8] hover:bg-[#009494] text-white">
              Search
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Filter className="h-4 w-4 text-[#2B2D42]" />
            <span className="text-[#2B2D42] font-medium mr-2">Filter:</span>
            {jobCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[#00A8A8] text-white"
                    : "bg-white text-[#2B2D42] border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="flex gap-4 flex-wrap">
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8] text-[#2B2D42]"
            >
              <option value="All">Filter by Type</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="FREELANCE">Freelance</option>
              <option value="REMOTE">Remote</option>
              <option value="INTERNSHIP">Internship</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8] text-[#2B2D42]"
            >
              <option value="All">Filter by Location</option>
              <option value="Remote">Remote</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Lahore">Lahore</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A8A8] mx-auto mb-4"></div>
            <div className="text-[#2B2D42]/60 text-lg">Loading jobs...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <Button onClick={fetchJobs} className="bg-[#00A8A8] hover:bg-[#009494] text-white w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Job Listings */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-[#2B2D42] mb-2">{job.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.jobType === "REMOTE"
                        ? "bg-green-100 text-green-800"
                        : job.jobType === "PART_TIME"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-[#00A8A8]/10 text-[#00A8A8]"
                    }`}
                  >
                    {formatJobType(job.jobType)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-[#2B2D42]/70">{job.location}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="text-[#2B2D42]/70">
                    {job.postedBy.jobProviderProfile?.companyName || job.company}
                  </span>
                </div>

                {job.salary && <div className="text-[#00A8A8] font-semibold mb-3">{job.salary}</div>}

                {job.skills && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.split(", ").map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-[#2B2D42] text-xs rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[#2B2D42]/70 text-sm mb-4 line-clamp-3">{job.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#2B2D42]/60 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{getTimeAgo(job.createdAt)}</span>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedJobId(job.id)
                      setCurrentView("detail")
                    }}
                    className="bg-[#00A8A8] hover:bg-[#009494] text-white px-6"
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
          <div className="text-center py-12">
            <div className="text-[#2B2D42]/60 text-lg">
              No jobs found matching your criteria. Try adjusting your filters.
            </div>
          </div>
        )}

        {!isLoading && !error && jobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[#2B2D42]/60 text-lg mb-4">No jobs available at the moment.</div>
            <Button onClick={fetchJobs} className="bg-[#00A8A8] hover:bg-[#009494] text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}

        <ChangePasswordDialog open={showChangePassword} onClose={() => setShowChangePassword(false)} />
      </div>
    </div>
  )
}
