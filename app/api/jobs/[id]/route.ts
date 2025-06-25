import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const job = await prisma.job.findUnique({
      where: {
        id: id,
      },
      include: {
        postedBy: {
          select: {
            name: true,
            jobProviderProfile: {
              select: {
                companyName: true,
                logo: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/jobs/[id] - Permanently delete a job
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.userType !== "JOB_PROVIDER") {
      return NextResponse.json({ error: "Only job providers can delete jobs" }, { status: 403 })
    }

    // Check if the job exists and belongs to the user
    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: {
        postedById: true,
        title: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (existingJob.postedById !== session.user.id) {
      return NextResponse.json({ error: "You can only delete your own jobs" }, { status: 403 })
    }

    // Delete all applications first (due to foreign key constraints)
    await prisma.application.deleteMany({
      where: { jobId: id },
    })

    // Then delete the job
    const deletedJob = await prisma.job.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Job and all associated applications deleted successfully",
      job: {
        id: deletedJob.id,
        title: deletedJob.title,
        applicationsDeleted: existingJob._count.applications,
      },
    })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
