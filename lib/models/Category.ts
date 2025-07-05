import type { ObjectId } from "mongodb"

export interface Category {
  _id?: ObjectId
  name: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}
