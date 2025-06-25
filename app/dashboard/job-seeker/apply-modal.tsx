"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { X, Upload, FileText, Trash2, CheckCircle, AlertCircle } from "lucide-react"

interface ApplyModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  jobTitle: string
  companyName: string
}

interface UploadedFile {
  name: string
  size: number
  type: string
  file: File
  url?: string
}

interface ExistingApplication {
  id: string
  status: string
  createdAt: string
}

export default function ApplyModal({ isOpen, onClose, jobId, jobTitle, companyName }: ApplyModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isCheckingApplication, setIsCheckingApplication] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user has already applied when modal opens
  useEffect(() => {
    if (isOpen && jobId) {
      checkExistingApplication()
    }
  }, [isOpen, jobId])

  const checkExistingApplication = async () => {
    setIsCheckingApplication(true)
    try {
      const response = await fetch(`/api/applications?jobId=${jobId}`)
      if (response.ok) {
        const applications = await response.json()
        const existingApp = applications.find((app: any) => app.job.id === jobId)
        if (existingApp) {
          setExistingApplication({
            id: existingApp.id,
            status: existingApp.status,
            createdAt: existingApp.createdAt,
          })
        }
      }
    } catch (error) {
      console.error("Error checking existing application:", error)
    } finally {
      setIsCheckingApplication(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB limit
    })

    if (validFiles.length !== files.length) {
      setError("Some files were rejected. Please upload only PDF, DOC, or DOCX files under 10MB.")
      return
    }

    if (validFiles.length === 0) {
      return
    }

    setError("")
    setIsUploading(true)

    try {
      const file = validFiles[0]
      const mockUrl = `/uploads/resume/${Date.now()}_${file.name}`

      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        url: mockUrl,
      }

      setUploadedFiles([uploadedFile])
      setSuccess("Resume uploaded successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error uploading file:", error)
      setError("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload your resume before applying.")
      return
    }

    if (!uploadedFiles[0].url) {
      setError("Please wait for the file to finish uploading.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const requestBody = {
        jobId: jobId,
        coverLetter: coverLetter,
        resumeUrl: uploadedFiles[0].url,
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError)
        setError(`Invalid response from server: ${responseText}`)
        return
      }

      if (response.ok) {
        alert("Application submitted successfully!")
        onClose()
        // Reset form
        setUploadedFiles([])
        setCoverLetter("")
        setError("")
        setSuccess("")
        setExistingApplication(null)
      } else {
        // Handle the "already applied" error specifically
        if (data.error === "You have already applied for this job") {
          // Refresh the existing application check
          await checkExistingApplication()
          setError("You have already applied for this job. Your application status is shown below.")
        } else {
          setError(data.error || "Failed to submit application")
        }
      }
    } catch (error) {
      console.error("Network error submitting application:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setError("Network error: Unable to connect to server. Please check your connection.")
      } else {
        setError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-[#2B2D42]">
              {existingApplication ? "Application Status" : "Apply Now"}
            </h2>
            <p className="text-[#2B2D42]/70 mt-1">
              {existingApplication
                ? "You have already applied for this position"
                : "We'll review your application and our recruiters will take a look at it"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Job Info */}
          <div className="mb-6 p-4 bg-[#00A8A8]/5 rounded-lg border border-[#00A8A8]/20">
            <h3 className="font-semibold text-[#2B2D42]">{jobTitle}</h3>
            <p className="text-[#2B2D42]/70">{companyName}</p>
          </div>

          {/* Loading State */}
          {isCheckingApplication && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-600 text-sm">Checking application status...</p>
            </div>
          )}

          {/* Existing Application Status */}
          {existingApplication && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-[#00A8A8]" />
                <h4 className="font-semibold text-[#2B2D42]">Your Application</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#2B2D42]/70">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      existingApplication.status,
                    )}`}
                  >
                    {formatApplicationStatus(existingApplication.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#2B2D42]/70">Applied on:</span>
                  <span className="text-sm text-[#2B2D42]">{formatDate(existingApplication.createdAt)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>What's next?</strong> Our team will review your application and contact you if you're selected
                  for the next round. You can check your application status anytime from your dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Show application form only if no existing application */}
          {!existingApplication && (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              {/* File Upload Area */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Resume/CV *</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver ? "border-[#00A8A8] bg-[#00A8A8]/5" : "border-gray-300 hover:border-[#00A8A8]/50"
                  }`}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-[#2B2D42]/70 mb-2">Drop files here</p>
                  <p className="text-sm text-[#2B2D42]/50 mb-4">or click to browse (PDF, DOC, DOCX - Max 10MB)</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="border-[#00A8A8] text-[#00A8A8] hover:bg-[#00A8A8] hover:text-white"
                  >
                    {isUploading ? "Uploading..." : "Choose Files"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-[#2B2D42] mb-3">Uploaded File:</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[#00A8A8]" />
                          <div>
                            <p className="text-sm font-medium text-[#2B2D42]">{file.name}</p>
                            <p className="text-xs text-[#2B2D42]/60">{formatFileSize(file.size)}</p>
                            {file.url && (
                              <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Ready to submit
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2B2D42] mb-2">Cover Letter (Optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're interested in this position..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8A8] text-[#2B2D42]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || uploadedFiles.length === 0 || isUploading || !uploadedFiles[0]?.url}
                  className="flex-1 bg-[#00A8A8] hover:bg-[#009494] text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </>
          )}

          {/* Close button for existing application */}
          {existingApplication && (
            <div className="flex justify-end">
              <Button onClick={onClose} className="bg-[#00A8A8] hover:bg-[#009494] text-white px-8">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
