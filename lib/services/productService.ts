import { getDatabase } from "@/lib/mongodb"
import type { Product, CreateProductInput } from "@/lib/models/Product"
import { ObjectId } from "mongodb"

export class ProductService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<Product>("products")
  }

  async createProduct(productData: CreateProductInput, createdBy: string): Promise<Product> {
    const collection = await this.getCollection()

    // Check if barcode already exists
    const existingProduct = await collection.findOne({ barcode: productData.barcode })
    if (existingProduct) {
      throw new Error("Product with this barcode already exists")
    }

    const product: Product = {
      ...productData,
      maxStockLevel: productData.maxStockLevel || productData.minStockLevel * 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
    }

    const result = await collection.insertOne(product)
    return { ...product, _id: result.insertedId }
  }

  async getAllProducts(): Promise<Product[]> {
    const collection = await this.getCollection()
    return await collection.find({ isActive: true }).toArray()
  }

  async getProductById(id: string): Promise<Product | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id), isActive: true })
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ barcode, isActive: true })
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  async updateStock(id: string, newQuantity: number): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          quantityInStock: newQuantity,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  async deleteProduct(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  async getLowStockProducts(): Promise<Product[]> {
    const collection = await this.getCollection()
    return await collection
      .find({
        isActive: true,
        $expr: { $lte: ["$quantityInStock", "$minStockLevel"] },
      })
      .toArray()
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    const collection = await this.getCollection()
    return await collection
      .find({
        isActive: true,
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { barcode: { $regex: searchTerm, $options: "i" } },
          { category: { $regex: searchTerm, $options: "i" } },
        ],
      })
      .toArray()
  }
}
