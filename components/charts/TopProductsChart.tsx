"use client"

import { Badge } from "@/components/ui/badge"

export function TopProductsChartImpl() {
  const topProducts = [
    { name: "iPhone 15 Pro", sales: 45, revenue: 44999.55 },
    { name: "Samsung Galaxy S24", sales: 38, revenue: 34199.62 },
    { name: "MacBook Air M3", sales: 22, revenue: 28599.78 },
    { name: "Nike Air Max", sales: 67, revenue: 8709.33 },
    { name: "Apple Watch Series 9", sales: 31, revenue: 12399.69 },
  ]

  const maxRevenue = Math.max(...topProducts.map((p) => p.revenue))

  return (
    <div className="space-y-4">
      {topProducts.map((product, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                #{index + 1}
              </Badge>
              <span className="font-medium text-sm">{product.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">${product.revenue.toLocaleString()}</div>
              <div className="text-xs text-gray-600">{product.sales} units</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TopProductsChartImpl
