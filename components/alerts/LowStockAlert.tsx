"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package } from "lucide-react";
import { count } from "console";

interface LowStockAlertStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  lowStockCount: number;
  outOfStockCount: number;
  todaySales: number;
  monthSales: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  quantityInStock: number;
  minStockLevel: number;
  category: string;
}

interface LowStockProductStats {
  products: LowStockProduct[];
  count: number;
}

export function LowStockAlert() {
  const [stats, setStats] = useState<LowStockAlertStats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    todaySales: 0,
    monthSales: 0,
  });
  const [lowStockProducts, setLowStockProducts] =
    useState<LowStockProductStats>({
      products: [],
      count: 0,
    });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch dashboard statistics
      const [statsResponse, lowStockResponse] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/products/low-stock"),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        // Fallback to dummy data if API fails
        setStats({
          totalSales: 0.0,
          totalOrders: 0,
          totalProducts: 0,
          totalUsers: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          todaySales: 0,
          monthSales: 0,
        });
      }

      if (lowStockResponse.ok) {
        const lowStockData = await lowStockResponse.json();
        setLowStockProducts(lowStockData);
      } else {
        // Fallback to dummy data if API fails
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback to dummy data on error
      setStats({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        todaySales: 0,
        monthSales: 0,
      });
      // setLowStockProducts([
      //   {
      //     id: "1",
      //     name: "Null",
      //     quantityInStock: 0,
      //     minStockLevel: 0,
      //     category: "Null",
      //   },
      // ]);
    } finally {
      setIsLoading(false);
    }
  };

  const lowStockItems = [
    {
      id: "1",
      name: "Nike Air Max",
      currentStock: 3,
      minStock: 20,
      category: "Footwear",
    },
  ];

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Low Stock Alert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.isArray(lowStockProducts.products) &&
            lowStockProducts.products.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.quantityInStock === 0
                    ? "bg-red-100 border border-red-400"
                    : "bg-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantityInStock} left (min: {item.minStockLevel})
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{item.category}</Badge>
                  <Button size="sm" variant="outline">
                    Reorder
                  </Button>
                </div>
              </div>
            ))}

          {/* Optional fallback message if no low stock products */}
          {lowStockProducts.products?.length === 0 && (
            <p className="text-sm text-gray-600 text-center">
              No low stock products.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
