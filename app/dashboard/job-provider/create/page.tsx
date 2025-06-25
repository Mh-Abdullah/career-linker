"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "../../../../components/ui/button"
import { ArrowLeft, Save } from "lucide-react"

export default function CreateJobPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    jobType: "FULL_TIME",
    experience: "",
    skills: "",
    requirements: "",
    benefits: "",
    isRemote: false,
    applicationDeadline: "",
  })

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
  }, [session, status, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/dashboard/job-provider")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create job")
      }
    } catch (error) {
      console.error("Error creating job:", error)
      setError("Network error creating job")
    } finally {
      setIsSubmitting(false)
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

          <div className="flex items-center gap-4">
            <span className="text-[#2B2D42]">Welcome, {session.user.name}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => router.back()} variant="ghost" className="text-[#00A8A8] hover:text-[#009494]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#2B2D42]">Post New Job</h1>
            <p className="text-[#2B2D42]/70">Create a new job posting to attract top talent</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-[#2B2D42] mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                  placeholder="e.g. Senior React Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Company Name *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                  placeholder="e.g. TechCorp Solutions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Salary Range</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                  placeholder="e.g. $80,000 - $120,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Job Type *</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Experience Level</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                  placeholder="e.g. 3-5 years"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isRemote"
                  checked={formData.isRemote}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#00A8A8] focus:ring-[#00A8A8] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-[#2B2D42]">This is a remote position</label>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-[#2B2D42] mb-6">Job Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Job Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Required Skills</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                  placeholder="e.g. React, TypeScript, Node.js, JavaScript (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                  placeholder="List the key requirements and qualifications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Benefits & Perks</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                  placeholder="Describe the benefits, perks, and what makes your company great..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Application Deadline</label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#00A8A8] hover:bg-[#009494] text-white">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating..." : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
