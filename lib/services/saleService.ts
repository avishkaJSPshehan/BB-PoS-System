import { getDatabase } from "@/lib/mongodb"
import type { Sale, SaleItem } from "@/lib/models/Sale"
import { ObjectId } from "mongodb"
import { ProductService } from "./productService"

export class SaleService {
  private productService = new ProductService()

  private async getCollection() {
    const db = await getDatabase()
    return db.collection<Sale>("sales")
  }

  async createSale(saleData: {
    items: SaleItem[]
    subtotal: number
    tax: number
    discount: number
    total: number
    paymentMethod: "cash" | "card" | "digital"
    paymentAmount: number
    change: number
    cashierId: string
    cashierName: string
    customerName?: string
    customerEmail?: string
  }): Promise<Sale> {
    const collection = await this.getCollection()

    // Generate sale number
    const saleCount = await collection.countDocuments()
    const saleNumber = `SALE-${Date.now()}-${saleCount + 1}`
    console.log(saleNumber)

    // Update product stock
    for (const item of saleData.items) {
      const product = await this.productService.getProductById(item.productId.toString())
      if (product) {
        const newStock = product.quantityInStock - item.quantity
        await this.productService.updateStock(item.productId.toString(), newStock)
      }
    }

    const sale: Sale = {
      saleNumber,
      items: saleData.items,
      subtotal: saleData.subtotal,
      tax: saleData.tax,
      discount: saleData.discount,
      total: saleData.total,
      paymentMethod: saleData.paymentMethod,
      paymentAmount: saleData.paymentAmount,
      change: saleData.change,
      cashierId: new ObjectId(saleData.cashierId),
      cashierName: saleData.cashierName,
      customerName: saleData.customerName,
      customerEmail: saleData.customerEmail,
      status: "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(sale)
    return { ...sale, _id: result.insertedId }
  }

  async getSaleById(id: string): Promise<Sale | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    const collection = await this.getCollection()
    return await collection
      .find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ createdAt: -1 })
      .toArray()
  }

  async getSalesByCashier(cashierId: string, startDate?: Date, endDate?: Date): Promise<Sale[]> {
    const collection = await this.getCollection()
    const query: any = { cashierId: new ObjectId(cashierId) }

    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate }
    }

    return await collection.find(query).sort({ createdAt: -1 }).toArray()
  }

  async getDailySummary(date: Date): Promise<{
    totalSales: number
    totalTransactions: number
    averageTransaction: number
    cashSales: number
    cardSales: number
  }> {
    const collection = await this.getCollection()
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const sales = await collection
      .find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: "completed",
      })
      .toArray()

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalTransactions = sales.length
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0
    const cashSales = sales.filter((s) => s.paymentMethod === "cash").reduce((sum, sale) => sum + sale.total, 0)
    const cardSales = sales.filter((s) => s.paymentMethod === "card").reduce((sum, sale) => sum + sale.total, 0)

    return {
      totalSales,
      totalTransactions,
      averageTransaction,
      cashSales,
      cardSales,
    }
  }
}
