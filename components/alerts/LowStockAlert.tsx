"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package } from "lucide-react"

export function LowStockAlert() {
  const lowStockItems = [
    { id: "1", name: "Nike Air Max", currentStock: 3, minStock: 20, category: "Footwear" },
    { id: "2", name: "iPhone 15 Pro", currentStock: 8, minStock: 10, category: "Electronics" },
    { id: "3", name: "Samsung Earbuds", currentStock: 2, minStock: 15, category: "Electronics" },
  ]

  if (lowStockItems.length === 0) {
    return null
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
          {lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.currentStock} left (min: {item.minStock})
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
        </div>
      </CardContent>
    </Card>
  )
}
