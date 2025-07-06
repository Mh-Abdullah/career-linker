"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import { ArrowLeft, MapPin, Clock, Briefcase, CheckCircle, Building } from "lucide-react"
import ApplyModal from "./apply-modal"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu" // adjust path if needed
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "../../../components/theme-toggle"

interface JobDetail {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  jobType: string
  skills?: string
  description: string
  experience?: string
  createdAt: string
  isActive: boolean
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

interface JobDetailPageProps {
  jobId: string
  onBack?: () => void
}

export default function JobDetailPage({ jobId, onBack }: JobDetailPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Only fetch job details on initial mount or after reload, not on every navigation or tab switch
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

    // Only fetch if job is not loaded and the page is visible
    if (!job && typeof document !== "undefined" && document.visibilityState === "visible") {
      fetchJobDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router, jobId])

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/jobs/${jobId}`)

      if (response.ok) {
        const jobData = await response.json()
        setJob(jobData)
      } else {
        setError("Job not found")
      }
    } catch (error) {
      console.error("Error fetching job details:", error)
      setError("Failed to load job details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = () => {
    setIsApplyModalOpen(true)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push("/dashboard/job-seeker")
    }
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

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-[#2B2D42]">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.userType !== "JOB_SEEKER") {
    return null
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#2B2D42] text-lg mb-4">{error || "Job not found"}</div>
          <Button onClick={handleBack} className="bg-[#00A8A8] hover:bg-[#009494] text-white">
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  // Create mock requirements, tasks, and benefits based on job data
  const requirements = [
    `Experience in ${job.skills || "relevant technologies"}`,
    `Strong understanding of ${job.title.toLowerCase()} best practices`,
    `${job.experience || "2-5 years"} of professional experience`,
    "Excellent problem-solving and communication skills",
  ]

  const tasks = [
    `Develop and maintain ${job.title.toLowerCase()} solutions`,
    "Collaborate with cross-functional teams",
    "Participate in code reviews and technical discussions",
    "Contribute to project planning and estimation",
  ]

  const benefits = [
    job.salary ? `Competitive salary: ${job.salary}` : "Competitive salary package",
    "Health insurance and wellness programs",
    "Professional development opportunities",
    "Flexible work arrangements",
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-card border-b border-border">
  <div className="container mx-auto px-6 py-4 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center cursor-pointer" onClick={() => router.push("/dashboard/job-seeker")}>
      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
        <span className="text-white font-bold">CL</span>
      </div>
      <span className="text-xl font-semibold text-purple-600">CareerLinker</span>
    </div>

    {/* Desktop View */}
    <div className="hidden md:flex items-center gap-4">
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-[#2B2D42] dark:text-white">{session.user.name}</span>
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

    {/* Mobile View */}
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-md hover:bg-muted focus:outline-none">
            <svg
              className="w-6 h-6 text-gray-700 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48 mt-2">
          <DropdownMenuItem>
            <ThemeToggle />
          </DropdownMenuItem>
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
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Back Button */}
        <Button onClick={handleBack} variant="ghost" className="mb-6 text-purple-600 hover:text-purple-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <div className="bg-card rounded-lg border border-border p-8 mb-6 text-foreground">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                  Currently Hiring
                </span>
                <span className="px-3 py-1 bg-foreground/10 text-foreground rounded-full text-sm font-medium">
                  {formatJobType(job.jobType)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{job.title}</h1>
              <p className="text-foreground/70 text-lg leading-relaxed">{job.description}</p>
            </div>
            <Button
              onClick={handleApply}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold ml-6"
            >
              APPLY
            </Button>
          </div>

          {/* Job Details */}
          <div className="flex flex-wrap gap-6 text-foreground/70">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-foreground/60" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-foreground/60" />
              <span>{formatJobType(job.jobType)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-foreground/60" />
              <span>{job.postedBy.jobProviderProfile?.companyName || job.company}</span>
            </div>
            {job.salary && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-foreground/60" />
                <span className="font-semibold text-purple-600">{job.salary}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {job.skills && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {job.skills.split(", ").map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-foreground/10 text-foreground text-sm rounded-md font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Application Stats */}
          <div className="mt-4 text-sm text-foreground/60">
            {job._count.applications} applications • Posted {getTimeAgo(job.createdAt)}
          </div>
        </div>

        {/* Job Sections */}
        <div className="space-y-6">
          {/* Requirements */}
          <div className="bg-card rounded-lg border border-border p-8">
            <h2 className="text-2xl font-bold text-purple-600 mb-6">Requirements:</h2>
            <ul className="space-y-3">
              {requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expected Tasks */}
          <div className="bg-card rounded-lg border border-border p-8">
            <h2 className="text-2xl font-bold text-purple-600 mb-6">Expected Tasks:</h2>
            <ul className="space-y-3">
              {tasks.map((task, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">{task}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-card rounded-lg border border-border p-8">
            <h2 className="text-2xl font-bold text-purple-600 mb-6">Benefits:</h2>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Apply Section */}
        <div className="bg-card rounded-lg border border-border p-8 mt-6 text-center text-foreground">
          <h3 className="text-xl font-semibold text-foreground mb-4">Ready to Apply?</h3>
          <p className="text-foreground/70 mb-6">
            Join {job.postedBy.jobProviderProfile?.companyName || job.company} and be part of an innovative team.
          </p>
          <Button
            onClick={handleApply}
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-3 text-lg font-semibold"
          >
            APPLY FOR THIS POSITION
          </Button>
        </div>

        {/* Apply Modal */}
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          jobId={job.id}
          jobTitle={job.title}
          companyName={job.postedBy.jobProviderProfile?.companyName || job.company}
        />
      </div>
    </div>
  )
}
