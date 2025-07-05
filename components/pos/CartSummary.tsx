"use client"

import { useCart } from "@/contexts/CartContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"

export function CartSummary() {
  const { items, updateQuantity, removeItem, clearCart, total, tax, discount, setTax, setDiscount, grandTotal } =
    useCart()

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
            <p className="text-sm text-gray-500 mt-1">Add products to start a sale</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart Summary
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {item.category}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 ml-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-6 w-6 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-6 w-6 p-0"
                  disabled={item.quantity >= item.maxStock}
                >
                  <Plus className="h-3 w-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Tax and Discount */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tax" className="text-xs">
                Tax (%)
              </Label>
              <Input
                id="tax"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={tax}
                onChange={(e) => setTax(Number.parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="discount" className="text-xs">
                Discount (%)
              </Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discount}
                onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {tax > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax ({tax}%):</span>
              <span>${((total * tax) / 100).toFixed(2)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({discount}%):</span>
              <span>-${((total * discount) / 100).toFixed(2)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
