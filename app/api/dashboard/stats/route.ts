import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.userType !== "JOB_PROVIDER") {
      return NextResponse.json({ error: "Only job providers can access this endpoint" }, { status: 403 })
    }

    // Get statistics for the job provider
    const [activeJobs, totalApplications, recentApplications] = await Promise.all([
      // Count active jobs
      prisma.job.count({
        where: {
          postedById: session.user.id,
          isActive: true,
        },
      }),
      // Count total applications
      prisma.application.count({
        where: {
          job: {
            postedById: session.user.id,
          },
        },
      }),
      // Get recent applications count (last 7 days)
      prisma.application.count({
        where: {
          job: {
            postedById: session.user.id,
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    // Get the most recent job and its application count
    const mostRecentJob = await prisma.job.findFirst({
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

    return NextResponse.json({
      activeJobs,
      totalApplications,
      recentApplications,
      mostRecentJobApplications: mostRecentJob?._count.applications || 0,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
