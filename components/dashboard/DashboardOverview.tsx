"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SalesChart, TopProductsChart } from "@/components/charts";
import { LowStockAlert } from "@/components/alerts/LowStockAlert";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  RefreshCw,
  Calendar,
  BarChart3,
} from "lucide-react";

interface DashboardStats {
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
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    todaySales: 0,
    monthSales: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );
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
        setLowStockProducts([
          {
            id: "1",
            name: "Null",
            quantityInStock: 0,
            minStockLevel: 0,
          },
        ]);
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
      setLowStockProducts([
        {
          id: "1",
          name: "Null",
          quantityInStock: 0,
          minStockLevel: 0,
        },
        
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-full bg-green-100">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              LKR {stats.totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-100">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalOrders.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Products
            </CardTitle>
            <div className="p-2 rounded-full bg-purple-100">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalProducts}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {stats.lowStockCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {stats.lowStockCount} low stock
                </Badge>
              )}
              {stats.outOfStockCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.outOfStockCount} out of stock
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Users
            </CardTitle>
            <div className="p-2 rounded-full bg-indigo-100">
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              <span className="text-green-600">+2</span> new this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Sales Overview
            </CardTitle>
            <CardDescription>Daily sales for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <SalesChart /> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Best performing products this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* <TopProductsChart /> */}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest transactions and system updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Sale completed",
                amount: "$125.50",
                time: "2 minutes ago",
                type: "sale",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "sale"
                        ? "bg-green-500"
                        : activity.type === "product"
                        ? "bg-blue-500"
                        : activity.type === "inventory"
                        ? "bg-yellow-500"
                        : "bg-purple-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-600">
                      {activity.amount || activity.time || activity.type}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {activity.time}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
