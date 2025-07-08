import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Get total products
    const totalProducts = await db
      .collection("products")
      .countDocuments({ isActive: true });

    // Get total sales
    const salesAggregation = await db
      .collection("sales")
      .aggregate([
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
            totalOrders: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const salesData = salesAggregation[0] || { totalSales: 0, totalOrders: 0 };

    // Get low stock count
    const lowStockCount = await db.collection("products").countDocuments({
      isActive: true,
      $expr: {
        $lte: ["$quantityInStock", "$minStockLevel"],
      },
    });

    // Get low stock details
    const lowStockDetails = await db
      .collection("products")
      .find({
        isActive: true,
        $expr: {
          $lte: ["$quantityInStock", "$minStockLevel"],
        },
      })
      .toArray();

    // Get out of stock count
    const outOfStockCount = await db.collection("products").countDocuments({
      isActive: true,
      quantityInStock: 0,
    });

    // Get total users
    const totalUsers = await db
      .collection("users")
      .countDocuments({ isActive: true });

    // Get today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySalesAggregation = await db
      .collection("sales")
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: today,
              $lt: tomorrow,
            },
          },
        },
        {
          $group: {
            _id: null,
            todaySales: { $sum: "$total" },
          },
        },
      ])
      .toArray();

    const todaySales = todaySalesAggregation[0]?.todaySales || 0;

    const stats = {
      totalSales: salesData.totalSales,
      totalOrders: salesData.totalOrders,
      totalProducts,
      totalUsers,
      lowStockCount,
      outOfStockCount,
      todaySales,
      monthSales: salesData.totalSales, // For now, using total sales
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
