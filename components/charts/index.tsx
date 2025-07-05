"use client"
import dynamic from "next/dynamic"

// Lazy-loaded versions – Next.js WILL NOT try to compile them to WASM on first paint
export const SalesChart = dynamic(() => import("./SalesChart").then((m) => m.SalesChartImpl), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded bg-gray-200" />,
})

export const TopProductsChart = dynamic(() => import("./TopProductsChart").then((m) => m.TopProductsChartImpl), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded bg-gray-200" />,
})
