"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Briefcase, User } from "lucide-react"

export default function SelectUserType() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<"JOB_SEEKER" | "JOB_PROVIDER" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // If user already has a userType, redirect to appropriate dashboard
    if (session?.user && session.user.userType && !session.user.needsUserType) {
      if (session.user.userType === "JOB_SEEKER") {
        router.push("/dashboard/job-seeker")
      } else {
        router.push("/dashboard/job-provider")
      }
    }
  }, [session, router])

  const handleSubmit = async () => {
    if (!selectedType) {
      setError("Please select a user type")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Update user type in database
      const response = await fetch("/api/auth/update-user-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType: selectedType,
        }),
      })

      if (response.ok) {
        // Update the session
        await update({
          userType: selectedType,
          needsUserType: false,
        })

        // Redirect to appropriate dashboard
        if (selectedType === "JOB_SEEKER") {
          router.push("/dashboard/job-seeker")
        } else {
          router.push("/dashboard/job-provider")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to update user type")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-md w-96 text-foreground border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome to CareerLinker!</h1>
          <p className="text-foreground/80 mt-2">Tell us how you plan to use CareerLinker</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Job Seeker Option */}
          <div
            onClick={() => setSelectedType("JOB_SEEKER")}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedType === "JOB_SEEKER"
                ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                : "border-border hover:border-purple-300"
            }`}
          >
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-foreground">I'm looking for a job</h3>
                <p className="text-sm text-foreground/70">
                  Search and apply for job opportunities
                </p>
              </div>
            </div>
          </div>

          {/* Job Provider Option */}
          <div
            onClick={() => setSelectedType("JOB_PROVIDER")}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedType === "JOB_PROVIDER"
                ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                : "border-border hover:border-purple-300"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Briefcase className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-foreground">I'm hiring talent</h3>
                <p className="text-sm text-foreground/70">
                  Post jobs and find the right candidates
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!selectedType || isLoading} 
          className="w-full"
        >
          {isLoading ? "Setting up your account..." : "Continue"}
        </Button>
      </div>
    </div>
  )
}
