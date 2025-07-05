import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    const lowStockProducts = await db
      .collection("products")
      .find({
        isActive: true,
        $expr: { $lte: ["$quantityInStock", "$minStockLevel"] },
      })
      .sort({ quantityInStock: 1 })
      .toArray()

    // Transform the data to include string IDs
    const formattedProducts = lowStockProducts.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      quantityInStock: product.quantityInStock,
      minStockLevel: product.minStockLevel,
      category: product.category,
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return NextResponse.json({ error: "Failed to fetch low stock products" }, { status: 500 })
  }
}
