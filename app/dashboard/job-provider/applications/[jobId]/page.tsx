"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { Button } from "../../../../../components/ui/button"
import { ArrowLeft, Download, Eye, Mail, Phone, Calendar, FileText, User } from "lucide-react"

interface Application {
  id: string
  status: string
  coverLetter?: string
  resume?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    jobSeekerProfile?: {
      firstName?: string
      lastName?: string
      phone?: string
      location?: string
      bio?: string
      skills?: string
      experience?: string
      education?: string
      resume?: string
      linkedinUrl?: string
      githubUrl?: string
      portfolio?: string
      availability?: string
      salaryExpectation?: string
    }
  }
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  createdAt: string
}

export default function JobApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string

  // Add this debug log
  console.log("JobApplicationsPage - jobId:", jobId, "params:", params)

  const [applications, setApplications] = useState<Application[]>([])
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`/api/jobs/${jobId}/applications`)

      if (response.ok) {
        const applicationsData = await response.json()
        setApplications(applicationsData)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        setError(`Failed to load applications: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      setError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  // Wrap fetchJobDetails in useCallback to fix React Hook dependency warning
  const fetchJobDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      if (response.ok) {
        const jobData = await response.json()
        setJob(jobData)
      }
    } catch (error) {
      console.error("Error fetching job details:", error)
    }
  }, [jobId])

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

    fetchApplications()
    fetchJobDetails()
  }, [session, status, router, jobId, fetchApplications, fetchJobDetails])

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchApplications() // Refresh applications
      } else {
        const errorData = await response.json()
        alert(`Failed to update application: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error updating application:", error)
      alert("Network error updating application")
    }
  }

  const formatApplicationStatus = (status: string) => {
    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "REVIEWED":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "INTERVIEW":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "ACCEPTED":
        return "text-green-600 bg-green-50 border-green-200"
      case "REJECTED":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDownloadResume = (resumeUrl: string, applicantName: string) => {
    if (resumeUrl) {
      // Create a temporary link to download the file
      const link = document.createElement("a")
      link.href = resumeUrl
      link.download = `${applicantName.replace(/\s+/g, "_")}_Resume.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (status === "loading" || isLoading) {
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
      <nav className="bg-white dark:bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">CL</span>
            </div>
            <span className="text-xl font-semibold text-purple-600">CareerLinker</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#2B2D42]">Welcome, {session.user.name}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push("/dashboard/job-provider")}
            variant="ghost"
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#2B2D42]">Job Applications</h1>
            {job && (
              <p className="text-[#2B2D42]/70">
                {job.title} at {job.company} • {applications.length} applications
              </p>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <Button onClick={fetchApplications} className="bg-[#00A8A8] hover:bg-[#009494] text-white">
              Try Again
            </Button>
          </div>
        )}

        {/* Applications List */}
        {!error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications List */}
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <div className="text-[#2B2D42]/60 text-lg">No applications yet</div>
                </div>
              ) : (
                applications.map((application) => (
                  <div
                    key={application.id}
                    className={`bg-white rounded-lg border border-gray-200 p-6 cursor-pointer transition-all ${
                      selectedApplication?.id === application.id
                        ? "ring-2 ring-[#00A8A8] border-[#00A8A8]"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedApplication(application)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#00A8A8]/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-[#00A8A8]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#2B2D42]">
                            {application.user.jobSeekerProfile?.firstName && application.user.jobSeekerProfile?.lastName
                              ? `${application.user.jobSeekerProfile.firstName} ${application.user.jobSeekerProfile.lastName}`
                              : application.user.name}
                          </h3>
                          <p className="text-sm text-[#2B2D42]/70">{application.user.email}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}
                      >
                        {formatApplicationStatus(application.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[#2B2D42]/70 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Applied {formatDate(application.createdAt)}</span>
                      </div>
                      {application.user.jobSeekerProfile?.location && (
                        <div className="flex items-center gap-1">
                          <span>{application.user.jobSeekerProfile.location}</span>
                        </div>
                      )}
                    </div>

                    {application.user.jobSeekerProfile?.skills && (
                      <div className="flex flex-wrap gap-2">
                        {application.user.jobSeekerProfile.skills
                          .split(", ")
                          .slice(0, 3)
                          .map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-[#2B2D42] text-xs rounded-md">
                              {skill}
                            </span>
                          ))}
                        {application.user.jobSeekerProfile.skills.split(", ").length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-[#2B2D42] text-xs rounded-md">
                            +{application.user.jobSeekerProfile.skills.split(", ").length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Application Details Column */}
            <div className="lg:sticky lg:top-8">
              {selectedApplication ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#2B2D42] mb-2">
                        {selectedApplication.user.jobSeekerProfile?.firstName &&
                        selectedApplication.user.jobSeekerProfile?.lastName
                          ? `${selectedApplication.user.jobSeekerProfile.firstName} ${selectedApplication.user.jobSeekerProfile.lastName}`
                          : selectedApplication.user.name}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedApplication.status)}`}
                      >
                        {formatApplicationStatus(selectedApplication.status)}
                      </span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-[#2B2D42] mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-600" />
                        <span className="text-[#2B2D42]">{selectedApplication.user.email}</span>
                      </div>
                      {selectedApplication.user.jobSeekerProfile?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-purple-600" />
                          <span className="text-[#2B2D42]">{selectedApplication.user.jobSeekerProfile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Information */}
                  {selectedApplication.user.jobSeekerProfile && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-[#2B2D42] mb-3">Profile</h3>
                      <div className="space-y-3">
                        {selectedApplication.user.jobSeekerProfile.bio && (
                          <div>
                            <p className="text-sm font-medium text-[#2B2D42] mb-1">Bio</p>
                            <p className="text-[#2B2D42]/70">{selectedApplication.user.jobSeekerProfile.bio}</p>
                          </div>
                        )}
                        {selectedApplication.user.jobSeekerProfile.experience && (
                          <div>
                            <p className="text-sm font-medium text-[#2B2D42] mb-1">Experience</p>
                            <p className="text-[#2B2D42]/70">{selectedApplication.user.jobSeekerProfile.experience}</p>
                          </div>
                        )}
                        {selectedApplication.user.jobSeekerProfile.skills && (
                          <div>
                            <p className="text-sm font-medium text-[#2B2D42] mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedApplication.user.jobSeekerProfile.skills.split(", ").map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-[#00A8A8]/10 text-[#00A8A8] text-xs rounded-md"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {selectedApplication.coverLetter && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-[#2B2D42] mb-3">Cover Letter</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-[#2B2D42]/80 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                      </div>
                    </div>
                  )}

                  {/* Resume */}
                  {(selectedApplication.resume || selectedApplication.user.jobSeekerProfile?.resume) && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-[#2B2D42] mb-3">Resume</h3>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <span className="text-[#2B2D42] flex-1">
                          {selectedApplication.user.jobSeekerProfile?.firstName &&
                          selectedApplication.user.jobSeekerProfile?.lastName
                            ? `${selectedApplication.user.jobSeekerProfile.firstName}_${selectedApplication.user.jobSeekerProfile.lastName}_Resume.pdf`
                            : `${selectedApplication.user.name.replace(/\s+/g, "_")}_Resume.pdf`}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadResume(
                              selectedApplication.resume || selectedApplication.user.jobSeekerProfile?.resume || "",
                              selectedApplication.user.jobSeekerProfile?.firstName &&
                                selectedApplication.user.jobSeekerProfile?.lastName
                                ? `${selectedApplication.user.jobSeekerProfile.firstName} ${selectedApplication.user.jobSeekerProfile.lastName}`
                                : selectedApplication.user.name,
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Additional Profile Information */}
                  {selectedApplication.user.jobSeekerProfile && (
                    <>
                      {selectedApplication.user.jobSeekerProfile.education && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-[#2B2D42] mb-3">Education</h3>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-[#2B2D42]/80 whitespace-pre-wrap">
                              {selectedApplication.user.jobSeekerProfile.education}
                            </p>
                          </div>
                        </div>
                      )}

                      {(selectedApplication.user.jobSeekerProfile.linkedinUrl ||
                        selectedApplication.user.jobSeekerProfile.githubUrl ||
                        selectedApplication.user.jobSeekerProfile.portfolio) && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-[#2B2D42] mb-3">Links</h3>
                          <div className="space-y-2">
                            {selectedApplication.user.jobSeekerProfile.linkedinUrl && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#2B2D42] w-20">LinkedIn:</span>
                                <a
                                  href={selectedApplication.user.jobSeekerProfile.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:underline text-sm"
                                >
                                  {selectedApplication.user.jobSeekerProfile.linkedinUrl}
                                </a>
                              </div>
                            )}
                            {selectedApplication.user.jobSeekerProfile.githubUrl && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#2B2D42] w-20">GitHub:</span>
                                <a
                                  href={selectedApplication.user.jobSeekerProfile.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:underline text-sm"
                                >
                                  {selectedApplication.user.jobSeekerProfile.githubUrl}
                                </a>
                              </div>
                            )}
                            {selectedApplication.user.jobSeekerProfile.portfolio && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#2B2D42] w-20">Portfolio:</span>
                                <a
                                  href={selectedApplication.user.jobSeekerProfile.portfolio}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:underline text-sm"
                                >
                                  {selectedApplication.user.jobSeekerProfile.portfolio}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(selectedApplication.user.jobSeekerProfile.availability ||
                        selectedApplication.user.jobSeekerProfile.salaryExpectation) && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-[#2B2D42] mb-3">Availability & Expectations</h3>
                          <div className="space-y-2">
                            {selectedApplication.user.jobSeekerProfile.availability && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-[#2B2D42]">Available to start:</span>
                                <span className="text-sm text-[#2B2D42]">
                                  {selectedApplication.user.jobSeekerProfile.availability}
                                </span>
                              </div>
                            )}
                            {selectedApplication.user.jobSeekerProfile.salaryExpectation && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-[#2B2D42]">Salary expectation:</span>
                                <span className="text-sm text-[#2B2D42]">
                                  {selectedApplication.user.jobSeekerProfile.salaryExpectation}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <select
                      value={selectedApplication.status}
                      onChange={(e) => updateApplicationStatus(selectedApplication.id, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    <Button
                      onClick={() => window.open(`mailto:${selectedApplication.user.email}`)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-[#2B2D42]/60">Select an application to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
