import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/applications/[id] - Update application status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.userType !== "JOB_PROVIDER") {
      return NextResponse.json({ error: "Only job providers can update application status" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Verify the application exists and the job belongs to the current user
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            postedById: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (application.job.postedById !== session.user.id) {
      return NextResponse.json({ error: "You can only update applications for your own jobs" }, { status: 403 })
    }

    // Update the application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        job: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Application status updated successfully",
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        jobTitle: updatedApplication.job.title,
        applicantName: updatedApplication.user.name,
      },
    })
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// GET /api/applications/[id] - Get specific application details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            postedById: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            jobSeekerProfile: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.userType === "JOB_PROVIDER") {
      if (application.job.postedById !== session.user.id) {
        return NextResponse.json({ error: "You can only view applications for your own jobs" }, { status: 403 })
      }
    } else if (session.user.userType === "JOB_SEEKER") {
      if (application.userId !== session.user.id) {
        return NextResponse.json({ error: "You can only view your own applications" }, { status: 403 })
      }
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
