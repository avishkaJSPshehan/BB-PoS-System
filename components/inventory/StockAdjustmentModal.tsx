"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdjust: (itemId: string, adjustment: number, reason: string) => void
  item: {
    id: string
    productName: string
    currentStock: number
  } | null
}

export function StockAdjustmentModal({ isOpen, onClose, onAdjust, item }: StockAdjustmentModalProps) {
  const [type, setType] = useState<"increase" | "decrease">("increase")
  const [qty, setQty] = useState("")
  const [reason, setReason] = useState("")
  const [customReason, setCustomReason] = useState("")

  useEffect(() => {
    // reset when opening
    if (isOpen) {
      setType("increase")
      setQty("")
      setReason("")
      setCustomReason("")
    }
  }, [isOpen])

  if (!item) return null

  const predefinedReasons = {
    increase: [
      "Stock received from supplier",
      "Return from customer",
      "Inventory count adjustment",
      "Transfer from another branch",
    ],
    decrease: ["Damaged goods", "Expired products", "Theft/Loss", "Transfer to another branch", "Sample/Demo usage"],
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseInt(qty || "0", 10)
    if (!amount) return

    const adj = type === "increase" ? amount : -amount
    const finalReason = reason === "other" ? customReason : reason

    onAdjust(item.id, adj, finalReason)
    onClose()
  }

  const projectedStock =
    type === "increase"
      ? item.currentStock + (Number.parseInt(qty || "0", 10) || 0)
      : item.currentStock - (Number.parseInt(qty || "0", 10) || 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock for {item.productName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Increase / Decrease */}
          <div>
            <Label className="text-sm font-medium">Adjustment Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as "increase" | "decrease")}
              className="mt-2 flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="increase" value="increase" />
                <Label htmlFor="increase">Increase</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="decrease" value="decrease" />
                <Label htmlFor="decrease">Decrease</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="qty">Quantity *</Label>
            <Input id="qty" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} required />
            {qty && (
              <p className="text-xs text-gray-600 mt-1">
                New stock level will be <span className="font-medium">{projectedStock}</span>
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason *</Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full border rounded-md h-9 px-3 text-sm"
              required
            >
              <option value="" disabled>
                Select reason
              </option>
              {predefinedReasons[type].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="other">Other (specify)</option>
            </select>
          </div>

          {reason === "other" && (
            <div>
              <Label htmlFor="customReason">Custom Reason *</Label>
              <Textarea
                id="customReason"
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                required
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!qty || Number.parseInt(qty) <= 0}>
              Apply
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
