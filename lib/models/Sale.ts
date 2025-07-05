import type { ObjectId } from "mongodb"

export interface SaleItem {
  productId: ObjectId
  name: string
  barcode: string
  price: number
  quantity: number
  category: string
  total: number
}

export interface Sale {
  _id?: ObjectId
  saleNumber: string
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: "cash" | "card" | "digital"
  paymentAmount: number
  change: number
  cashierId: ObjectId
  cashierName: string
  customerName?: string
  customerEmail?: string
  status: "completed" | "refunded" | "cancelled"
  createdAt: Date
  updatedAt: Date
}
