"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Define User type for type assertion
interface User {
  id: string;
  email: string;
  name: string;
  userType: string;
  image?: string;
}

export default function DashboardRedirect() {
  const { data: session, status } = useSession() as { data: { user: User } | null, status: string }
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Redirect based on user type
    if (session && session.user && typeof (session.user as User).userType === "string") {
      const userType = (session.user as User).userType
      if (userType === "JOB_SEEKER") {
        router.push("/dashboard/job-seeker")
      } else if (userType === "JOB_PROVIDER") {
        router.push("/dashboard/job-provider")
      }
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <div className="text-[#2B2D42]">Redirecting...</div>
    </div>
  )
}
