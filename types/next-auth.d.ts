import NextAuth from "next-auth"


declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      userType: string | null
      needsUserType: boolean
    }
  }

  interface User {
    userType: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userType?: string
    needsUserType?: boolean
  }
}
