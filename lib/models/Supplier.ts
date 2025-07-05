import type { ObjectId } from "mongodb"

export interface Supplier {
  _id?: ObjectId
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  status: "active" | "inactive"
  productsSupplied: string[]
  totalOrders: number
  lastOrderDate?: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
}
