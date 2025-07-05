// MongoDB Database Initialization Script
// Run this script to create indexes and initial data

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://jspshehan:SLpmEpqLoCZt88LQ@cluster0.vnk3mst.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("BB-POS-Database");

    // Create indexes
    console.log("Creating indexes...");

    // Users collection indexes
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });

    // Products collection indexes
    await db
      .collection("products")
      .createIndex({ barcode: 1 }, { unique: true });
    await db
      .collection("products")
      .createIndex({ name: "text", category: "text" });
    await db.collection("products").createIndex({ category: 1 });

    // Sales collection indexes
    await db
      .collection("sales")
      .createIndex({ saleNumber: 1 }, { unique: true });
    await db.collection("sales").createIndex({ createdAt: -1 });
    await db.collection("sales").createIndex({ cashierId: 1 });

    // Categories collection indexes
    await db
      .collection("categories")
      .createIndex({ name: 1 }, { unique: true });

    // Suppliers collection indexes
    await db.collection("suppliers").createIndex({ name: 1 });
    await db.collection("suppliers").createIndex({ email: 1 });

    console.log("Indexes created successfully");

    // Create default admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    const adminUser = {
      username: "admin",
      email: "admin@possystem.com",
      password: adminPassword,
      firstName: "System",
      lastName: "Administrator",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
    };

    const existingAdmin = await db
      .collection("users")
      .findOne({ username: "admin" });
    if (!existingAdmin) {
      await db.collection("users").insertOne(adminUser);
      console.log("Default admin user created");
    }

    // Create default categories
    const defaultCategories = [
      {
        name: "Electronics",
        description: "Electronic devices and gadgets",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },
      {
        name: "Clothing",
        description: "Apparel and fashion items",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },
      {
        name: "Footwear",
        description: "Shoes and sandals",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },
      {
        name: "Accessories",
        description: "Fashion accessories",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },
    ];

    for (const category of defaultCategories) {
      const existing = await db
        .collection("categories")
        .findOne({ name: category.name });
      if (!existing) {
        await db.collection("categories").insertOne(category);
      }
    }

    console.log("Default categories created");
    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Database initialization error:", error);
  } finally {
    await client.close();
  }
}

initializeDatabase();
