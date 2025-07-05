"use client"

import { useEffect, useRef } from "react"

export function SalesChartImpl() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Sample data for the last 7 days
    const data = [1200, 1900, 3000, 5000, 2000, 3000, 4500]
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    const maxValue = Math.max(...data)
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }

    // Draw bars
    const barWidth = (chartWidth / data.length) * 0.6
    const barSpacing = chartWidth / data.length

    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding + index * barSpacing + (barSpacing - barWidth) / 2
      const y = canvas.height - padding - barHeight

      // Draw bar
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw value on top of bar
      ctx.fillStyle = "#374151"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`$${value}`, x + barWidth / 2, y - 5)

      // Draw label
      ctx.fillText(labels[index], x + barWidth / 2, canvas.height - padding + 20)
    })

    // Draw y-axis labels
    ctx.textAlign = "right"
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * (5 - i)
      const y = padding + (chartHeight / 5) * i
      ctx.fillText(`$${Math.round(value)}`, padding - 10, y + 4)
    }
  }, [])

  return (
    <div className="w-full h-64">
      <canvas ref={canvasRef} width={400} height={256} className="w-full h-full" />
    </div>
  )
}

export default SalesChartImpl
