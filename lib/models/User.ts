import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  username: string
  email: string
  password: string // hashed
  firstName: string
  lastName: string
  role: "admin" | "cashier" | "inventory_manager" | "viewer"
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface CreateUserInput {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: "admin" | "cashier" | "inventory_manager" | "viewer"
}
