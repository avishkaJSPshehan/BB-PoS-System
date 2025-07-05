"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PurchaseOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (order: {
    supplier: string
    product: string
    quantity: number
    notes: string
  }) => void
}

/** Simple purchase-order form; expand as needed. */
export function PurchaseOrderModal({ isOpen, onClose, onSubmit }: PurchaseOrderModalProps) {
  const [form, setForm] = useState({
    supplier: "",
    product: "",
    quantity: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      supplier: form.supplier,
      product: form.product,
      quantity: Number.parseInt(form.quantity || "0", 10),
      notes: form.notes,
    })
    setForm({ supplier: "", product: "", quantity: "", notes: "" })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supplier">Supplier *</Label>
            <Input
              id="supplier"
              value={form.supplier}
              onChange={(e) => setForm((p) => ({ ...p, supplier: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="product">Product *</Label>
            <Input
              id="product"
              value={form.product}
              onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
