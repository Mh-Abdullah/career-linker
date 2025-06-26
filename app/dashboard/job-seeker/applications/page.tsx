"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Briefcase, Clock, RefreshCw, ArrowLeft } from "lucide-react"
import JobDetailPage from "../job-detail"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Application {
  id: string
  status: string
  job: {
    id: string
    title: string
    company: string
    location: string
    jobType: string
    createdAt: string
    postedBy: {
      jobProviderProfile?: {
        companyName: string
      }
    }
  }
  createdAt: string
}

export default function AppliedJobsPage({ setSelectedJobId, setCurrentView }: { setSelectedJobId?: (id: string) => void, setCurrentView?: (view: "list" | "detail") => void } = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchApplications()
  }, [session, status, router])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await fetch("/api/applications", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
      if (res.ok) {
        const data = await res.json()
        setApplications(Array.isArray(data) ? data : [])
      } else {
        setError("Failed to load applications.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
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
                <DropdownMenuItem onClick={() => router.push("/account/change-password")}>Change Password</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const confirmed = confirm("Are you sure you want to delete your account?")
                    if (confirmed) {
                      // You can later implement DELETE call to your backend here
                      alert("Delete account logic goes here")
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
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/job-seeker")}
            className="flex items-center gap-2 text-[#00A8A8] hover:bg-[#00A8A8]/10"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Jobs
          </Button>
          <h1 className="text-3xl font-bold text-[#2B2D42] ml-4">Applied Jobs</h1>
        </div>
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A8A8] mx-auto mb-4"></div>
            <div className="text-[#2B2D42]/60 text-lg">Loading applications...</div>
          </div>
        )}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <Button onClick={fetchApplications} className="bg-[#00A8A8] hover:bg-[#009494] text-white w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}
        {!isLoading && !error && applications.length === 0 && (
          <div className="text-center py-12 text-[#2B2D42]/60 text-lg">You have not applied to any jobs yet.</div>
        )}
        {!isLoading && !error && applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-[#2B2D42] mb-2">{app.job.title}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#00A8A8]/10 text-[#00A8A8]">
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="text-[#2B2D42]/70">{app.job.postedBy.jobProviderProfile?.companyName || app.job.company}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#2B2D42]/70">{app.job.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[#2B2D42]/60 text-sm mb-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
                <Button
                  onClick={() => {
                    if (setSelectedJobId && setCurrentView) {
                      setSelectedJobId(app.job.id)
                      setCurrentView('detail')
                    } else {
                      router.push(`/dashboard/job-seeker/job/${app.job.id}`)
                    }
                  }}
                  className="bg-[#00A8A8] hover:bg-[#009494] text-white px-6 mt-2"
                >
                  View Job
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
