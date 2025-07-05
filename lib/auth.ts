import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export interface AuthUser {
  userId: string
  username: string
  role: string
}

export async function verifyToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser

    return decoded
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}
