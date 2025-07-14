import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const sales = await db.collection("sales").find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

    const total = await db.collection("sales").countDocuments({})

    const formattedSales = sales.map((sale) => ({
      id: sale._id.toString(),
      // _id: sale._id.toString(),
      ...sale,
    }))

    return NextResponse.json({
      sales: formattedSales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const body = await request.json()

    const { items, subtotal, tax, total, paymentMethod, amountPaid, change, cashier } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in sale" }, { status: 400 })
    }

    // Start a session for transaction
    const session = db.client.startSession()

    try {
      await session.withTransaction(async () => {
        // Create the sale record
        const saleData = {
          items,
          subtotal: Number.parseFloat(subtotal),
          tax: Number.parseFloat(tax),
          total: Number.parseFloat(total),
          paymentMethod,
          amountPaid: Number.parseFloat(amountPaid),
          change: Number.parseFloat(change || 0),
          cashier: cashier || "Unknown",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const saleResult = await db.collection("sales").insertOne(saleData, { session })

        // Update product stock levels
        for (const item of items) {
          if (item.productId) {
            await db
              .collection("products")
              .updateOne(
                { _id: new ObjectId(item.productId) },
                { $inc: { quantityInStock: -item.quantity }, $set: { updatedAt: new Date() } },
                { session },
              )
          }
        }

        return saleResult
      })

      return NextResponse.json({ message: "Sale completed successfully" }, { status: 201 })
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
