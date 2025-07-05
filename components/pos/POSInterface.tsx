"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/contexts/CartContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProductGrid } from "@/components/pos/ProductGrid"
import { CartSummary } from "@/components/pos/CartSummary"
import { PaymentModal } from "@/components/pos/PaymentModal"
import { InvoiceModal } from "@/components/pos/InvoiceModal"
import { Search, ShoppingCart, CreditCard, Package, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  barcode: string
  price: number
  category: string
  quantityInStock: number
  image?: string
}

export function POSInterface() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showPayment, setShowPayment] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { items, itemCount, grandTotal, clearCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      console.log("Fetched products:", data) // Debug log

      if (Array.isArray(data)) {
        setProducts(data)
      } else {
        console.error("Products data is not an array:", data)
        setProducts([])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      console.log("Fetched categories:", data) // Debug log

      if (Array.isArray(data)) {
        setCategories(data)
      } else {
        console.error("Categories data is not an array:", data)
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories(["Electronics", "Clothing", "Books", "Home & Garden", "Sports"])
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.barcode && product.barcode.includes(searchTerm)),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const handlePaymentComplete = async (paymentData: any) => {
    try {
      const saleData = {
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
        })),
        subtotal: grandTotal,
        tax: grandTotal * 0.1, // 10% tax
        total: grandTotal * 1.1,
        paymentMethod: paymentData.method,
        amountPaid: paymentData.amount,
        change: paymentData.change,
        cashier: "Current User", // In real app, get from auth context
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      })

      if (!response.ok) {
        throw new Error("Failed to save sale")
      }

      setLastSale({ ...saleData, id: Date.now().toString(), timestamp: new Date().toISOString() })
      setShowPayment(false)
      setShowInvoice(true)
      clearCart()

      // Refresh products to update stock quantities
      await fetchProducts()

      toast({
        title: "Sale Completed",
        description: `Transaction completed successfully. Total: $${(grandTotal * 1.1).toFixed(2)}`,
      })
    } catch (error) {
      console.error("Error completing sale:", error)
      toast({
        title: "Error",
        description: "Failed to complete sale. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = async () => {
    await fetchProducts()
    await fetchCategories()
    toast({
      title: "Refreshed",
      description: "Product data has been refreshed",
    })
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading POS</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-gray-600 mt-1">Process sales and manage transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-gray-500" />
            <Badge variant="secondary" className="text-sm">
              {itemCount} items in cart
            </Badge>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products by name or barcode..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No products available. Add some products to get started."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <CartSummary />

          {items.length > 0 && (
            <Button className="w-full" size="lg" onClick={() => setShowPayment(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Process Payment
            </Button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentComplete={handlePaymentComplete}
        total={grandTotal * 1.1} // Including tax
      />

      {/* Invoice Modal */}
      <InvoiceModal isOpen={showInvoice} onClose={() => setShowInvoice(false)} saleData={lastSale} />
    </div>
  )
}
