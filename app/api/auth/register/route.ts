import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "../../../../lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, userType } = await request.json()

    if (!email || !password || !name || !userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        userType,
      },
    })

    // Create profile based on user type
    if (userType === "JOB_SEEKER") {
      await prisma.jobSeekerProfile.create({
        data: {
          userId: user.id,
          firstName: name.split(" ")[0] || "",
          lastName: name.split(" ")[1] || "",
        },
      })
    } else if (userType === "JOB_PROVIDER") {
      await prisma.jobProviderProfile.create({
        data: {
          userId: user.id,
          companyName: name,
        },
      })
    }

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
