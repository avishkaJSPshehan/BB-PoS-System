"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

export function TopProductsChartImpl() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [maxRevenue, setMaxRevenue] = useState(0);

  useEffect(() => {
    fetch("/api/sales/top-products")
      .then((res) => res.json())
      .then((data: TopProduct[]) => {
        setTopProducts(data);
        setMaxRevenue(Math.max(...data.map((p) => p.revenue)));
      })
      .catch((err) => {
        console.error("Failed to load top products:", err);
      });
  }, []);

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
              <div className="text-sm font-medium">
                ${product.revenue.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">{product.sales} units</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(product.revenue / maxRevenue) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default TopProductsChartImpl;
