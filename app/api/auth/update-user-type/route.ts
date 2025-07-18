import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userType } = body

    if (!userType || !["JOB_SEEKER", "JOB_PROVIDER"].includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    // Update user type in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { userType },
    })

    // Create the appropriate profile based on user type
    if (userType === "JOB_SEEKER") {
      // Check if profile already exists
      const existingProfile = await prisma.jobSeekerProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!existingProfile) {
        await prisma.jobSeekerProfile.create({
          data: {
            userId: session.user.id,
            firstName: session.user.name?.split(" ")[0] || "",
            lastName: session.user.name?.split(" ")[1] || "",
          },
        })
      }
    } else if (userType === "JOB_PROVIDER") {
      // Check if profile already exists
      const existingProfile = await prisma.jobProviderProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!existingProfile) {
        await prisma.jobProviderProfile.create({
          data: {
            userId: session.user.id,
            companyName: session.user.name || "My Company",
          },
        })
      }
    }

    return NextResponse.json({
      message: "User type updated successfully",
      userType: updatedUser.userType,
    })
  } catch (error) {
    console.error("Error updating user type:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
