import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/jobs/available - Get all available jobs for job seekers
export async function GET(request: NextRequest) {
  try {
    console.log("Available jobs API called")

    const session = await getServerSession(authOptions)
    console.log("Session:", session?.user?.email, session?.user?.userType)

    if (!session || !session.user) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.userType !== "JOB_SEEKER") {
      console.log("User is not a job seeker:", session.user.userType)
      return NextResponse.json({ error: "Only job seekers can view available jobs" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const jobType = searchParams.get("jobType")
    const location = searchParams.get("location")

    console.log("Search params:", { search, jobType, location })

    // Build the where clause
    const whereClause: Record<string, unknown> = {
      isActive: true,
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { skills: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (jobType && jobType !== "All") {
      whereClause.jobType = jobType
    }

    if (location && location !== "All") {
      whereClause.location = { contains: location, mode: "insensitive" }
    }

    console.log("Where clause:", JSON.stringify(whereClause, null, 2))

    const jobs = await prisma.job.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log("Found jobs:", jobs.length)
    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching available jobs:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
