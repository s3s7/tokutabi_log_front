declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: number
    }
  }

  interface User {
    id: string
    role?: number
    backendId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string
    uid?: string
    role?: number
    backendId?: string
  }
}