import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    credits?: number
    xp?: number
    role?: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      credits: number
      xp: number
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    credits?: number
    xp?: number
    role?: string
  }
}
