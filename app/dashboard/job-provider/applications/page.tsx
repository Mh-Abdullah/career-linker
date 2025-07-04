"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback, Suspense } from "react"
import { Button } from "../../../../components/ui/button"
import { ArrowLeft, Download, Eye, Mail, Phone, Calendar, FileText, User } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ThemeToggle } from "../../../../components/theme-toggle"
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

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
  // Add job info for all-applications view
  job?: {
    id: string
    title: string
    company: string
    location: string
  }
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  createdAt: string
  description?: string // Added to fix error
}

export default function ApplicationsPageWrapper() {
  return (
    <Suspense>
      <JobApplicationsPage />
    </Suspense>
  );
}

function JobApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get("jobId")

  const [applications, setApplications] = useState<Application[]>([])
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  // State for extracted resume text
  const [resumeText, setResumeText] = useState<string>("");

  // Wrap fetchApplications in useCallback to fix React Hook dependency warning
  const fetchApplications = useCallback(async () => {
    if (!jobId) return

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

  const fetchJobDetails = useCallback(async () => {
    if (!jobId) return

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

    if (!jobId) {
      // Fetch all applications for all jobs posted by this provider
      fetchAllApplications()
      setJob(null)
      return
    }

    fetchApplications()
    fetchJobDetails()
  }, [session, status, router, jobId, fetchApplications, fetchJobDetails])

  const fetchAllApplications = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetch("/api/job-provider/applications")
      if (response.ok) {
        const applicationsData = await response.json()
        setApplications(applicationsData)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        setError(`Failed to load applications: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

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

  // Helper: Calculate a simple relevance score (placeholder, replace with real logic or API)
  function calculateResumeRelevance(resumeText: string, jobDescription: string): number {
    if (!resumeText || !jobDescription) return 0;
    // Simple keyword overlap (case-insensitive, split by space)
    const resumeWords = new Set(resumeText.toLowerCase().split(/\W+/));
    const jobWords = new Set(jobDescription.toLowerCase().split(/\W+/));
    let matchCount = 0;
    jobWords.forEach(word => {
      if (resumeWords.has(word)) matchCount++;
    });
    return jobWords.size > 0 ? Math.round((matchCount / jobWords.size) * 100) : 0;
  }

  // Extract resume text from PDF when selectedApplication changes
  useEffect(() => {
    async function extractResumeTextFromPDF(url: string) {
      try {
        // Use the correct import path for pdfjs-dist v4+
        const pdfjsLib = await import('pdfjs-dist');
        // Use local worker file for better compatibility
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/_next/static/pdf.worker.min.js';
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items
  .filter((item): item is TextItem => typeof item === 'object' && 'str' in item)
  .map((item) => (item as TextItem).str)
  .join(" ") + " ";
        }
        console.log('[Resume Extraction] Extracted text:', text);
        setResumeText(text);
      } catch (err) {
        console.error('[Resume Extraction] Error extracting PDF text:', err);
        setResumeText("");
      }
    }
    if (selectedApplication) {
      // Prefer direct resume, fallback to jobSeekerProfile.resume
      const resumeUrl = selectedApplication.resume || selectedApplication.user.jobSeekerProfile?.resume || "";
      // Try to extract if it's a PDF (case-insensitive, anywhere in URL)
      if (resumeUrl && /\.pdf(\?|$)/i.test(resumeUrl)) {
        extractResumeTextFromPDF(resumeUrl);
      } else {
        setResumeText("");
      }
    } else {
      setResumeText("");
    }
  }, [selectedApplication, fetchApplications, fetchJobDetails]);

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

  if (!jobId) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#2B2D42] text-lg mb-4">No job ID provided</div>
          <Button
            onClick={() => router.push("/dashboard/job-provider")}
            className="bg-purple-600 hover:purple-600 text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
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
            {/* ✅ Theme Toggle */}
            <ThemeToggle />
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
            className="text-purple-600 hover:purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#2B2D42] dark:text-purple-600">Job Applications</h1>
            {job && (
              <p className="text-[#2B2D42]/70 dark:text-white">
                {job.title} at {job.company} • {applications.length} applications
              </p>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <Button onClick={fetchApplications} className="bg-purple-600 hover:bg-purple-700 text-white">
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
                    className={`bg-card rounded-lg border border-border p-6 cursor-pointer transition-all text-foreground dark:text-white ${
                      selectedApplication?.id === application.id
                        ? "ring-2 ring-purple-600 border-purple-700"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedApplication(application)}
                  >
                    {/* Show job info if jobId is not present (all applications view) */}
                    {!jobId && (
                      <div className="mb-2">
                        <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded mr-2">
                          {application.job?.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{application.job?.company}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground dark:text-white">
                            {application.user.jobSeekerProfile?.firstName && application.user.jobSeekerProfile?.lastName
                              ? `${application.user.jobSeekerProfile.firstName} ${application.user.jobSeekerProfile.lastName}`
                              : application.user.name}
                          </h3>
                          <p className="text-sm text-muted-foreground dark:text-white">{application.user.email}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)} bg-muted text-foreground dark:bg-muted dark:text-white`}
                      >
                        {formatApplicationStatus(application.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 dark:text-white">
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
                            <span key={index} className="px-2 py-1 bg-muted text-foreground dark:text-white text-xs rounded-md">
                              {skill}
                            </span>
                          ))}
                        {application.user.jobSeekerProfile.skills.split(", ").length > 3 && (
                          <span className="px-2 py-1 bg-muted text-foreground dark:text-white text-xs rounded-md">
                            +{application.user.jobSeekerProfile.skills.split(", ").length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Application Details */}
            <div className="lg:sticky lg:top-8">
              {selectedApplication ? (
                <div className="bg-card rounded-lg border border-border p-6 text-foreground dark:text-white">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                        {selectedApplication.user.jobSeekerProfile?.firstName &&
                        selectedApplication.user.jobSeekerProfile?.lastName
                          ? `${selectedApplication.user.jobSeekerProfile.firstName} ${selectedApplication.user.jobSeekerProfile.lastName}`
                          : selectedApplication.user.name}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedApplication.status)} bg-muted text-foreground dark:bg-muted dark:text-white`}
                      >
                        {formatApplicationStatus(selectedApplication.status)}
                      </span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground dark:text-white mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-foreground dark:text-white">{selectedApplication.user.email}</span>
                      </div>
                      {selectedApplication.user.jobSeekerProfile?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="text-foreground dark:text-white">{selectedApplication.user.jobSeekerProfile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Information */}
                  {selectedApplication.user.jobSeekerProfile && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-foreground dark:text-white mb-3">Profile</h3>
                      <div className="space-y-3">
                        {selectedApplication.user.jobSeekerProfile.bio && (
                          <div>
                            <p className="text-sm font-medium text-foreground dark:text-white mb-1">Bio</p>
                            <p className="text-muted-foreground dark:text-white">{selectedApplication.user.jobSeekerProfile.bio}</p>
                          </div>
                        )}
                        {selectedApplication.user.jobSeekerProfile.experience && (
                          <div>
                            <p className="text-sm font-medium text-foreground dark:text-white mb-1">Experience</p>
                            <p className="text-muted-foreground dark:text-white">{selectedApplication.user.jobSeekerProfile.experience}</p>
                          </div>
                        )}
                        {selectedApplication.user.jobSeekerProfile.skills && (
                          <div>
                            <p className="text-sm font-medium text-foreground dark:text-white mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedApplication.user.jobSeekerProfile.skills.split(", ").map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary/10 text-primary dark:bg-muted dark:text-white text-xs rounded-md"
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
                      <h3 className="font-semibold text-foreground dark:text-white mb-3">Cover Letter</h3>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-foreground/80 dark:text-white whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                      </div>
                    </div>
                  )}

                  {/* Resume */}
                  {(selectedApplication.resume || selectedApplication.user.jobSeekerProfile?.resume) && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-foreground dark:text-white mb-3">Resume</h3>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-foreground dark:text-white flex-1">
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

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-6">
                    <select
                      value={selectedApplication.status}
                      onChange={(e) => updateApplicationStatus(selectedApplication.id, e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground dark:text-white"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    <Button
                      onClick={() =>
                        window.open(
                          `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedApplication.user.email)}`,
                          "_blank"
                        )
                      }
                      className="bg-primary hover:bg-primary/80 text-white border border-primary dark:bg-primary dark:hover:bg-primary/80 dark:text-black dark:border-primary focus:ring-2 focus:ring-primary"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  </div>

                  {/* Resume Relevance Visualization */}
                  {selectedApplication && job && (
                    (() => {
                      // Use extracted resume text if available
                      const jobDescription = job.description || (job.title + " " + (job.company || "") + " " + (job.location || ""));
                      const relevance = calculateResumeRelevance(resumeText, jobDescription);
                      return (
                        <div className="mb-8 flex flex-col items-center w-full">
                          <h4 className="text-base font-semibold text-foreground dark:text-white mb-2">Resume Relevance to Job</h4>
                          <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" width={128} height={128}>
                              <circle cx="50" cy="50" r="45" fill="#F5F7FA" stroke="#e5e7eb" strokeWidth="8" />
                              <circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="#00A8A8"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 45}
                                strokeDashoffset={2 * Math.PI * 45 * (1 - relevance / 100)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.6s' }}
                              />
                              <text x="50" y="56" textAnchor="middle" fill="#00A8A8" fontSize="2rem" fontWeight="bold">{relevance}%</text>
                            </svg>
                          </div>
                          <p className="text-muted-foreground dark:text-white mt-2 text-xs">
                            {resumeText ? "Estimated match between resume and job description" : "Resume text not available or not a PDF"}
                          </p>
                        </div>
                      );
                    })()
                  )}
                </div>
                              
              ) : (
                <div className="bg-card rounded-lg border border-border p-12 text-center text-foreground dark:text-white">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground dark:text-white">Select an application to view details</p>
                </div>
              )}
              {/* Application Status Bar Chart */}
                  {applications.length > 0 && (
                    <div className="mt-8 p-6 rounded-xl bg-muted border border-border flex flex-col items-center text-foreground dark:text-white">
                      <h4 className="text-lg font-semibold text-foreground dark:text-white mb-4">Application Status Distribution</h4>
                      {(() => {
                        const chartData = [
                          { label: "Pending", value: applications.filter(a => a.status === "PENDING").length, color: "#facc15" },
                          { label: "Reviewed", value: applications.filter(a => a.status === "REVIEWED").length, color: "#60a5fa" },
                          { label: "Interview", value: applications.filter(a => a.status === "INTERVIEW").length, color: "#a78bfa" },
                          { label: "Accepted", value: applications.filter(a => a.status === "ACCEPTED").length, color: "#34d399" },
                          { label: "Rejected", value: applications.filter(a => a.status === "REJECTED").length, color: "#f87171" },
                        ].filter(d => d.value > 0);
                        if (chartData.length === 0) {
                          return <div className="text-red-500">No application status data to display.</div>;
                        }
                        return (
                          <>
                            <div style={{ width: 320, height: 220 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 16, right: 16, left: 16, bottom: 24 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                  <Bar dataKey="value" fill="#00A8A8" isAnimationActive={true}>
                                    {/* No labels on bars */}
                                  </Bar>
                                  {/* No Tooltip or Legend for minimal look */}
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                              {chartData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                                  <span className="text-sm text-foreground dark:text-white font-medium">{d.label}</span>
                                  <span className="text-xs text-muted-foreground dark:text-white">({d.value})</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-muted-foreground dark:text-white mt-2 text-xs">(Status breakdown for these applications)</p>
                          </>
                        );
                      })()}
                    </div>
                  )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}
