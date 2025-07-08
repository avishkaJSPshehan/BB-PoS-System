import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const topProducts = await db.collection("sales").aggregate([
      {
        $match: {
          createdAt: {
            $gte: today,
            $lt: tomorrow,
          },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.name",
          totalSales: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      {
        $sort: { totalSales: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          name: "$_id",
          sales: "$totalSales",
          revenue: "$totalRevenue",
          _id: 0,
        },
      },
    ]).toArray();

    return NextResponse.json(topProducts);
  } catch (error) {
    console.error("Error fetching top products:", error);
    return NextResponse.json(
      { error: "Failed to fetch top selling products" },
      { status: 500 }
    );
  }
}
