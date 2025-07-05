"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface CartItem {
  id: string
  name: string
  barcode: string
  price: number
  quantity: number
  category: string
  maxStock: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  tax: number
  discount: number
  setTax: (tax: number) => void
  setDiscount: (discount: number) => void
  grandTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [tax, setTax] = useState(0)
  const [discount, setDiscount] = useState(0)

  const addItem = (product: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.maxStock) {
          alert(`Cannot add more items. Maximum stock: ${product.maxStock}`)
          return prev
        }

        return prev.map((item) => (item.id === product.id ? { ...item, quantity: newQuantity } : item))
      }

      if (quantity > product.maxStock) {
        alert(`Cannot add more items. Maximum stock: ${product.maxStock}`)
        return prev
      }

      return [...prev, { ...product, quantity }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (quantity > item.maxStock) {
            alert(`Cannot exceed maximum stock: ${item.maxStock}`)
            return item
          }
          return { ...item, quantity }
        }
        return item
      }),
    )
  }

  const clearCart = () => {
    setItems([])
    setTax(0)
    setDiscount(0)
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const taxAmount = (total * tax) / 100
  const discountAmount = (total * discount) / 100
  const grandTotal = total + taxAmount - discountAmount

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        tax,
        discount,
        setTax,
        setDiscount,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
