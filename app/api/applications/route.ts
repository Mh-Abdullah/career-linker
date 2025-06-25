import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/applications - Create a new job application
export async function POST(request: NextRequest) {
  console.log("=== Applications API POST called ===")

  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 401 })
    }

    if (session.user.userType !== "JOB_SEEKER") {
      console.log("❌ User is not a job seeker:", session.user.userType)
      return NextResponse.json({ error: "Only job seekers can apply for jobs" }, { status: 403 })
    }

    let body
    try {
      body = await request.json()
      console.log("✅ Request body parsed:", body)
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { jobId, coverLetter, resumeUrl } = body

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    if (!resumeUrl) {
      return NextResponse.json({ error: "Resume is required" }, { status: 400 })
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        company: true,
        isActive: true,
        applicationDeadline: true,
        postedBy: {
          select: {
            jobProviderProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (!job.isActive) {
      return NextResponse.json({ error: "This job is no longer accepting applications" }, { status: 400 })
    }

    // Check application deadline
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return NextResponse.json({ error: "Application deadline has passed" }, { status: 400 })
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId: jobId,
          userId: session.user.id,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: jobId,
        userId: session.user.id,
        coverLetter: coverLetter || null,
        resume: resumeUrl,
        status: "PENDING",
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
            postedBy: {
              select: {
                jobProviderProfile: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        application: {
          id: application.id,
          jobTitle: application.job.title,
          company: application.job.postedBy.jobProviderProfile?.companyName || application.job.company,
          status: application.status,
          appliedAt: application.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error creating application:", error)

    const errorResponse = {
      error: "Internal server error",
      message: "Failed to create application",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// GET /api/applications - Get user's applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.userType !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Only job seekers can view applications" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    const whereClause: any = {
      userId: session.user.id,
    }

    // If jobId is provided, filter by specific job
    if (jobId) {
      whereClause.jobId = jobId
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        coverLetter: true,
        resume: true,
        interviewDate: true,
        feedback: true,
        createdAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            salary: true,
            jobType: true,
            isActive: true,
            postedBy: {
              select: {
                jobProviderProfile: {
                  select: {
                    companyName: true,
                    logo: true,
                  },
                },
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
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
