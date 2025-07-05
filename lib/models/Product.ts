import type { ObjectId } from "mongodb"

export interface Product {
  _id?: ObjectId
  name: string
  barcode: string
  category: string
  costPrice: number
  sellingPrice: number
  quantityInStock: number
  minStockLevel: number
  maxStockLevel: number
  supplier: string
  description?: string
  image?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface CreateProductInput {
  name: string
  barcode: string
  category: string
  costPrice: number
  sellingPrice: number
  quantityInStock: number
  minStockLevel: number
  maxStockLevel?: number
  supplier: string
  description?: string
}
