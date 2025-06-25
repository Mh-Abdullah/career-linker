"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "../../../../../components/ui/button"
import { ArrowLeft, MapPin, Clock, Briefcase, CheckCircle, Building } from "lucide-react"

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

// Mock job data - in real app, this would come from API
const mockJobDetails: { [key: string]: JobDetail } = {
  "1": {
    id: "1",
    title: "Senior React Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    salary: "$80,000 - $120,000",
    jobType: "FULL_TIME",
    skills: "React, TypeScript, Node.js",
    description:
      "Our company is a leading tech firm specializing in cutting-edge web applications. We are dedicated to pushing the boundaries of digital innovation and creating products that impact millions of users worldwide.",
    requirements: [
      "Proficiency in React and modern JavaScript/TypeScript",
      "Strong understanding of web development best practices",
      "Experience with state management libraries (Redux, Zustand)",
      "Knowledge of testing frameworks and methodologies",
    ],
    tasks: [
      "Develop and maintain high-quality React applications",
      "Collaborate with cross-functional teams to design and implement new features",
      "Optimize application performance and user experience",
      "Mentor junior developers and contribute to code reviews",
    ],
    benefits: [
      "Competitive salary and performance bonuses",
      "Flexible work hours and remote work options",
      "Professional development opportunities and conference attendance",
      "Health insurance and comprehensive wellness programs",
    ],
    createdAt: "2024-01-15T10:00:00Z",
    isActive: true,
  },
  "2": {
    id: "2",
    title: "UI/UX Designer",
    company: "Design Studio Pro",
    location: "New York, NY",
    salary: "$70,000 - $95,000",
    jobType: "FULL_TIME",
    skills: "Figma, Adobe XD, Prototyping",
    description:
      "We are a creative design agency focused on delivering exceptional user experiences for web and mobile applications. Our team works with Fortune 500 companies to create innovative digital solutions.",
    requirements: [
      "Proficiency in design tools like Figma, Adobe XD, and Sketch",
      "Strong portfolio demonstrating UI/UX design skills",
      "Understanding of user-centered design principles",
      "Experience with prototyping and user testing",
    ],
    tasks: [
      "Create wireframes, mockups, and interactive prototypes",
      "Conduct user research and usability testing",
      "Collaborate with developers to ensure design implementation",
      "Maintain and evolve design systems and style guides",
    ],
    benefits: [
      "Competitive salary with annual reviews",
      "Creative freedom and flexible work environment",
      "Access to latest design tools and software",
      "Health, dental, and vision insurance coverage",
    ],
    createdAt: "2024-01-14T14:30:00Z",
    isActive: true,
  },
}

export default function JobDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const [job, setJob] = useState<JobDetail | null>(null)
  const [isApplying, setIsApplying] = useState(false)

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

    // Load job details
    const jobDetail = mockJobDetails[jobId]
    if (jobDetail) {
      setJob(jobDetail)
    } else {
      router.push("/dashboard/job-seeker")
    }
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

  if (status === "loading" || !job) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-[#2B2D42]">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.userType !== "JOB_SEEKER") {
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

          <div className="flex items-center gap-4">
            <span className="text-[#2B2D42]">Welcome, {session.user.name}</span>
            <Button onClick={() => signOut()} variant="outline" size="sm">
              Sign Out
            </Button>
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
