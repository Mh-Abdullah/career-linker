"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Redirect based on user type
    if (
      session.user &&
      typeof (session.user as any).userType === "string"
    ) {
      const userType = (session.user as any).userType
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
