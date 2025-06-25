import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/jobs/[id]/applications - Get all applications for a specific job
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.userType !== "JOB_PROVIDER") {
      return NextResponse.json({ error: "Only job providers can view job applications" }, { status: 403 })
    }

    // Verify the job belongs to the current user
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { postedById: true, title: true, company: true },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (job.postedById !== session.user.id) {
      return NextResponse.json({ error: "You can only view applications for your own jobs" }, { status: 403 })
    }

    // Get all applications for this job with detailed user information
    const applications = await prisma.application.findMany({
      where: {
        jobId: jobId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            jobSeekerProfile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                location: true,
                bio: true,
                skills: true,
                experience: true,
                education: true,
                resume: true,
                linkedinUrl: true,
                githubUrl: true,
                portfolio: true,
                availability: true,
                salaryExpectation: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching job applications:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
