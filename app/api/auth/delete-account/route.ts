import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/auth/delete-account
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Delete all applications for this user (if job seeker)
    if (session.user.userType === "JOB_SEEKER") {
      await prisma.application.deleteMany({ where: { userId: session.user.id } })
    }
    // Delete all jobs and their applications for this user (if job provider)
    if (session.user.userType === "JOB_PROVIDER") {
      const jobs = await prisma.job.findMany({ where: { postedById: session.user.id } })
      const jobIds = jobs.map((job: { id: string }) => job.id)
      await prisma.application.deleteMany({ where: { jobId: { in: jobIds } } })
      await prisma.job.deleteMany({ where: { postedById: session.user.id } })
    }
    // Delete the user
    await prisma.user.delete({ where: { id: session.user.id } })
    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
