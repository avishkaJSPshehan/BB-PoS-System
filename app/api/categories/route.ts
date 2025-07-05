import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    // Get unique categories from products collection
    const categories = await db.collection("products").distinct("category", { isActive: true })

    // Get categories from categories collection if it exists
    const categoryDocs = await db.collection("categories").find({ isActive: true }).toArray()
    const categoryNames = categoryDocs.map((cat) => cat.name)

    // Combine and deduplicate
    const allCategories = [...new Set([...categories, ...categoryNames])].filter(Boolean)

    // If no categories exist, return default ones
    if (allCategories.length === 0) {
      return NextResponse.json(["Electronics", "Clothing", "Books", "Home & Garden", "Sports"])
    }

    return NextResponse.json(allCategories.sort())
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(["Electronics", "Clothing", "Books", "Home & Garden", "Sports"], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // Check if category already exists
    const existingCategory = await db.collection("categories").findOne({ name: name.trim() })

    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    const newCategory = {
      name: name.trim(),
      description: description || "",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("categories").insertOne(newCategory)

    const createdCategory = {
      ...newCategory,
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
    }

    return NextResponse.json(createdCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
