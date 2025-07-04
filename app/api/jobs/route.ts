import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/jobs - Get jobs (for job providers to see their own jobs)
export async function GET() {
  try {
    console.log("Jobs API GET called")

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userType = session.user.userType

    let jobs

    if (userType === "JOB_PROVIDER") {
      // Job providers see only their own jobs
      jobs = await prisma.job.findMany({
        where: {
          postedById: session.user.id,
        },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } else if (userType === "JOB_SEEKER") {
      // Job seekers should use /api/jobs/available instead
      return NextResponse.json({ error: "Job seekers should use /api/jobs/available" }, { status: 403 })
    } else {
      // Admin can see all jobs
      jobs = await prisma.job.findMany({
        include: {
          postedBy: {
            select: {
              name: true,
              email: true,
              jobProviderProfile: {
                select: {
                  companyName: true,
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
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    console.log(`Found ${jobs.length} jobs for user type: ${userType}`)
    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST /api/jobs - Create a new job (for job providers)
export async function POST(request: NextRequest) {
  try {
    console.log("Jobs API POST called")

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.userType !== "JOB_PROVIDER") {
      return NextResponse.json({ error: "Only job providers can create jobs" }, { status: 403 })
    }

    const body = await request.json()
    console.log("Job creation request body:", body)

    const {
      title,
      description,
      company,
      location,
      salary,
      jobType,
      experience,
      skills,
      requirements,
      benefits,
      isRemote,
      applicationDeadline,
    } = body

    // Validate required fields
    if (!title || !description || !company || !location) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, company, location" },
        { status: 400 },
      )
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        title,
        description,
        company,
        location,
        salary: salary || null,
        jobType: jobType || "FULL_TIME",
        experience: experience || null,
        skills: skills || null,
        requirements: requirements || null,
        benefits: benefits || null,
        isActive: true,
        isRemote: isRemote || false,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        postedById: session.user.id,
      },
      include: {
        postedBy: {
          select: {
            name: true,
            jobProviderProfile: {
              select: {
                companyName: true,
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

    console.log("Job created successfully:", job.id)

    return NextResponse.json(
      {
        message: "Job created successfully",
        job: job,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT /api/jobs - Update a job (for job providers)
export async function PUT(request: NextRequest) {
  try {
    console.log("Jobs API PUT called")

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.userType !== "JOB_PROVIDER") {
      return NextResponse.json({ error: "Only job providers can update jobs" }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Check if the job exists and belongs to the user
    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: { postedById: true },
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (existingJob.postedById !== session.user.id) {
      return NextResponse.json({ error: "You can only update your own jobs" }, { status: 403 })
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
        ...(updateData.applicationDeadline && {
          applicationDeadline: new Date(updateData.applicationDeadline),
        }),
      },
      include: {
        postedBy: {
          select: {
            name: true,
            jobProviderProfile: {
              select: {
                companyName: true,
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

    return NextResponse.json({
      message: "Job updated successfully",
      job: updatedJob,
    })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/jobs - Delete a job (for job providers)
export async function DELETE(request: NextRequest) {
  try {
    console.log("Jobs API DELETE called")

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.userType !== "JOB_PROVIDER") {
      return NextResponse.json({ error: "Only job providers can delete jobs" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("id")

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Check if the job exists and belongs to the user
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      select: { postedById: true, title: true },
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (existingJob.postedById !== session.user.id) {
      return NextResponse.json({ error: "You can only delete your own jobs" }, { status: 403 })
    }

    // Instead of deleting, we'll mark as inactive to preserve application history
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "Job deactivated successfully",
      job: {
        id: updatedJob.id,
        title: updatedJob.title,
        isActive: updatedJob.isActive,
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
