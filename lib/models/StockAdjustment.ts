import type { ObjectId } from "mongodb"

export interface StockAdjustment {
  _id?: ObjectId
  productId: ObjectId
  productName: string
  adjustmentType: "increase" | "decrease"
  quantity: number
  reason: string
  previousStock: number
  newStock: number
  adjustedBy: ObjectId
  adjustedByName: string
  createdAt: Date
}
