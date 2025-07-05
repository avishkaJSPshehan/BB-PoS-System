import { type NextRequest, NextResponse } from "next/server"
import { UserService } from "@/lib/services/userService"
import jwt from "jsonwebtoken"

const userService = new UserService()

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Find user
    const user = await userService.getUserByUsername(username)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await userService.verifyPassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    await userService.updateLastLogin(user._id!.toString())

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id!.toString(),
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    )

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: {
        ...userWithoutPassword,
        id: user._id!.toString(),
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
