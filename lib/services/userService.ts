import { getDatabase } from "@/lib/mongodb"
import type { User, CreateUserInput } from "@/lib/models/User"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export class UserService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<User>("users")
  }

  async createUser(userData: CreateUserInput, createdBy: string): Promise<User> {
    const collection = await this.getCollection()

    // Check if username or email already exists
    const existingUser = await collection.findOne({
      $or: [{ username: userData.username }, { email: userData.email }],
    })

    if (existingUser) {
      throw new Error("Username or email already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    const user: User = {
      ...userData,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
    }

    const result = await collection.insertOne(user)
    return { ...user, _id: result.insertedId }
  }

  async getUserById(id: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ username })
  }

  async getAllUsers(): Promise<User[]> {
    const collection = await this.getCollection()
    return await collection.find({ isActive: true }).toArray()
  }

  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  async deleteUser(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  async updateLastLogin(id: string): Promise<void> {
    const collection = await this.getCollection()
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { lastLogin: new Date() } })
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }
}
