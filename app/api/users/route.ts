import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    const users = await db
      .collection("users")
      .find({ isActive: true }, { projection: { password: 0 } }) // Exclude password field
      .sort({ createdAt: -1 })
      .toArray()

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      createdBy: user.createdBy,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const body = await request.json()

    const { username, email, password, firstName, lastName, role } = body

    if (!username || !email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if username or email already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = {
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "System", // In real app, get from auth context
    }

    const result = await db.collection("users").insertOne(newUser)

    // Return user without password
    const createdUser = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      isActive: newUser.isActive,
      lastLogin: newUser.lastLogin,
      createdAt: newUser.createdAt,
      createdBy: newUser.createdBy,
    }

    return NextResponse.json(createdUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
