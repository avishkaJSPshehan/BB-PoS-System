import type { ObjectId } from "mongodb"

export interface PurchaseOrderItem {
  productId: ObjectId
  productName: string
  quantity: number
  costPrice: number
  total: number
}

export interface PurchaseOrder {
  _id?: ObjectId
  orderNumber: string
  supplierId: ObjectId
  supplierName: string
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  total: number
  status: "pending" | "ordered" | "received" | "cancelled"
  orderDate: Date
  expectedDelivery?: Date
  receivedDate?: Date
  createdBy: ObjectId
  createdByName: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
