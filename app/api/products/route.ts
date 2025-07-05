import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const query: any = { isActive: true }

    // Add category filter if provided
    if (category && category !== "all") {
      query.category = category
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ]
    }

    const products = await db.collection("products").find(query).sort({ name: 1 }).skip(skip).limit(limit).toArray()

    const total = await db.collection("products").countDocuments(query)

    // Transform the data to include string IDs and proper structure
    const formattedProducts = products.map((product) => ({
      id: product._id.toString(),
      _id: product._id.toString(),
      name: product.name,
      barcode: product.barcode || "",
      category: product.category,
      costPrice: product.costPrice || 0,
      sellingPrice: product.sellingPrice || product.price || 0,
      price: product.sellingPrice || product.price || 0, // For POS interface
      quantityInStock: product.quantityInStock || 0,
      minStockLevel: product.minStockLevel || 5,
      supplier: product.supplier || "",
      description: product.description || "",
      isActive: product.isActive !== false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const body = await request.json()

    // Validate required fields
    const { name, price, category, quantityInStock, minStockLevel } = body
    if (!name || !price || !category || quantityInStock === undefined || minStockLevel === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newProduct = {
      name: body.name,
      barcode: body.barcode || "",
      category: body.category,
      costPrice: Number.parseFloat(body.costPrice || body.price),
      sellingPrice: Number.parseFloat(body.sellingPrice || body.price),
      price: Number.parseFloat(body.sellingPrice || body.price),
      quantityInStock: Number.parseInt(body.quantityInStock),
      minStockLevel: Number.parseInt(body.minStockLevel),
      supplier: body.supplier || "",
      description: body.description || "",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("products").insertOne(newProduct)

    const createdProduct = {
      ...newProduct,
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
    }

    return NextResponse.json(createdProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
