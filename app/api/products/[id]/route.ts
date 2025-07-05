import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const product = await db.collection("products").findOne({ _id: new ObjectId(id), isActive: true })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const formattedProduct = {
      id: product._id.toString(),
      _id: product._id.toString(),
      name: product.name,
      barcode: product.barcode || "",
      category: product.category,
      costPrice: product.costPrice || 0,
      sellingPrice: product.sellingPrice || product.price || 0,
      price: product.sellingPrice || product.price || 0,
      quantityInStock: product.quantityInStock || 0,
      minStockLevel: product.minStockLevel || 5,
      supplier: product.supplier || "",
      description: product.description || "",
      isActive: product.isActive !== false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const { id } = params
    const body = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const updateData = {
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
      updatedAt: new Date(),
    }

    const result = await db.collection("products").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const updatedProduct = await db.collection("products").findOne({ _id: new ObjectId(id) })

    const formattedProduct = {
      id: updatedProduct._id.toString(),
      _id: updatedProduct._id.toString(),
      ...updatedProduct,
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(id) }, { $set: { isActive: false, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
