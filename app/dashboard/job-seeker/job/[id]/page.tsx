"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "../../../../../components/ui/button"
import { ArrowLeft, MapPin, Clock, Briefcase, CheckCircle, Building } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface JobDetail {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  jobType: string
  skills?: string
  description: string
  requirements: string[]
  tasks: string[]
  benefits: string[]
  createdAt: string
  isActive: boolean
}

export default function JobDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const [job, setJob] = useState<JobDetail | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

    // Fetch job details from API
    const fetchJob = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        if (res.ok) {
          const data = await res.json()
          // Ensure requirements, tasks, and benefits are arrays
          const parseArray = (val: any) => {
            if (Array.isArray(val)) return val
            if (typeof val === 'string') {
              try {
                const arr = JSON.parse(val)
                if (Array.isArray(arr)) return arr
              } catch {}
              // fallback: split by newlines or commas
              return val.split(/\r?\n|,/).map((s: string) => s.trim()).filter(Boolean)
            }
            return []
          }
          setJob({
            id: data.id,
            title: data.title,
            company: data.company || data.postedBy?.jobProviderProfile?.companyName || data.postedBy?.name || "",
            location: data.location,
            salary: data.salary,
            jobType: data.jobType,
            skills: data.skills,
            description: data.description,
            requirements: parseArray(data.requirements),
            tasks: parseArray(data.tasks),
            benefits: parseArray(data.benefits),
            createdAt: data.createdAt,
            isActive: data.isActive,
          })
        } else {
          setError("Job not found.")
        }
      } catch (err) {
        setError("Failed to load job details.")
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [session, status, router, jobId])

  const handleApply = async () => {
    setIsApplying(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert("Application submitted successfully!")
    setIsApplying(false)
  }

  const formatJobType = (jobType: string) => {
    return jobType
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-[#2B2D42]">Loading...</div>
      </div>
    )
  }
  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-red-600 text-lg">{error || "Job not found."}</div>
      </div>
    )
  }

  if (!session || session.user.userType !== "JOB_SEEKER") {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
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
              onClick={() => router.push("/dashboard/job-seeker")}
            >
              Jobs
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-[#2B2D42]">{session?.user?.name}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 mt-2">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/job-seeker")}>Jobs</DropdownMenuItem>
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
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Back Button */}
        <Button onClick={() => router.back()} variant="ghost" className="mb-6 text-[#00A8A8] hover:text-[#009494]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#00A8A8]/10 text-[#00A8A8] rounded-full text-sm font-medium">
                  Currently Hiring
                </span>
                <span className="px-3 py-1 bg-gray-100 text-[#2B2D42] rounded-full text-sm font-medium">
                  {formatJobType(job.jobType)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[#2B2D42] mb-4">{job.title}</h1>
              <p className="text-[#2B2D42]/70 text-lg leading-relaxed">{job.description}</p>
            </div>
            <Button
              onClick={handleApply}
              disabled={isApplying}
              className="bg-[#00A8A8] hover:bg-[#009494] text-white px-8 py-3 text-lg font-semibold ml-6"
            >
              {isApplying ? "APPLYING..." : "APPLY"}
            </Button>
          </div>

          {/* Job Details */}
          <div className="flex flex-wrap gap-6 text-[#2B2D42]/70">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{formatJobType(job.jobType)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <span>{job.company}</span>
            </div>
            {job.salary && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                <span className="font-semibold text-[#00A8A8]">{job.salary}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {job.skills && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {job.skills.split(", ").map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-[#00A8A8]/10 text-[#00A8A8] text-sm rounded-md font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Job Sections */}
        <div className="space-y-6">
          {/* Requirements */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-[#00A8A8] mb-6">Requirements:</h2>
            <ul className="space-y-3">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00A8A8] mt-0.5 flex-shrink-0" />
                  <span className="text-[#2B2D42]/80">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expected Tasks */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-[#00A8A8] mb-6">Expected Tasks:</h2>
            <ul className="space-y-3">
              {job.tasks.map((task, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00A8A8] mt-0.5 flex-shrink-0" />
                  <span className="text-[#2B2D42]/80">{task}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-[#00A8A8] mb-6">Benefits:</h2>
            <ul className="space-y-3">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00A8A8] mt-0.5 flex-shrink-0" />
                  <span className="text-[#2B2D42]/80">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Apply Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mt-6 text-center">
          <h3 className="text-xl font-semibold text-[#2B2D42] mb-4">Ready to Apply?</h3>
          <p className="text-[#2B2D42]/70 mb-6">
            Join our team and be part of an innovative company that values growth and creativity.
          </p>
          <Button
            onClick={handleApply}
            disabled={isApplying}
            className="bg-[#00A8A8] hover:bg-[#009494] text-white px-12 py-3 text-lg font-semibold"
          >
            {isApplying ? "SUBMITTING APPLICATION..." : "APPLY FOR THIS POSITION"}
          </Button>
        </div>
      </div>
    </div>
  )
}
