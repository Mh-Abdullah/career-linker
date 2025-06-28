import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// POST /api/auth/change-password
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { oldPassword, newPassword } = await request.json()
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 })
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found or password not set." }, { status: 404 })
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: "Old password is incorrect." }, { status: 400 })
    }
    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } })
    return NextResponse.json({ message: "Password updated successfully." })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 })
  }
}
