"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StockAdjustmentModal } from "@/components/inventory/StockAdjustmentModal"
import { PurchaseOrderModal } from "@/components/inventory/PurchaseOrderModal"
import { Plus, Search, Package, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

interface InventoryItem {
  id: string
  productName: string
  barcode: string
  category: string
  currentStock: number
  minStockLevel: number
  maxStockLevel: number
  lastRestocked: string
  supplier: string
  costPrice: number
  totalValue: number
}

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showStockModal, setShowStockModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    let filtered = inventory

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.barcode.includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    setFilteredInventory(filtered)
  }, [inventory, searchTerm, selectedCategory])

  const fetchInventory = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockInventory: InventoryItem[] = [
        {
          id: "1",
          productName: "iPhone 15 Pro",
          barcode: "123456789012",
          category: "Electronics",
          currentStock: 25,
          minStockLevel: 10,
          maxStockLevel: 100,
          lastRestocked: "2024-01-20",
          supplier: "Apple Inc.",
          costPrice: 800,
          totalValue: 20000,
        },
        {
          id: "2",
          productName: "Samsung Galaxy S24",
          barcode: "123456789013",
          category: "Electronics",
          currentStock: 30,
          minStockLevel: 15,
          maxStockLevel: 80,
          lastRestocked: "2024-01-21",
          supplier: "Samsung",
          costPrice: 700,
          totalValue: 21000,
        },
        {
          id: "3",
          productName: "Nike Air Max",
          barcode: "123456789015",
          category: "Footwear",
          currentStock: 3,
          minStockLevel: 20,
          maxStockLevel: 150,
          lastRestocked: "2024-01-15",
          supplier: "Nike",
          costPrice: 80,
          totalValue: 240,
        },
        {
          id: "4",
          productName: "Levi's 501 Jeans",
          barcode: "123456789017",
          category: "Clothing",
          currentStock: 40,
          minStockLevel: 25,
          maxStockLevel: 200,
          lastRestocked: "2024-01-23",
          supplier: "Levi Strauss & Co.",
          costPrice: 45,
          totalValue: 1800,
        },
      ]

      setInventory(mockInventory)
      setFilteredInventory(mockInventory)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const categories = ["all", ...Array.from(new Set(inventory.map((item) => item.category)))]

  const getStockStatus = (item: InventoryItem) => {
    const stockPercentage = (item.currentStock / item.maxStockLevel) * 100

    if (item.currentStock === 0) {
      return { label: "Out of Stock", variant: "destructive" as const, color: "text-red-600" }
    } else if (item.currentStock <= item.minStockLevel) {
      return { label: "Low Stock", variant: "secondary" as const, color: "text-orange-600" }
    } else if (stockPercentage > 80) {
      return { label: "Overstocked", variant: "outline" as const, color: "text-blue-600" }
    } else {
      return { label: "Normal", variant: "default" as const, color: "text-green-600" }
    }
  }

  const handleStockAdjustment = (itemId: string, adjustment: number, reason: string) => {
    if (!hasPermission("inventory.update")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to adjust stock",
        variant: "destructive",
      })
      return
    }

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.currentStock + adjustment)
          return {
            ...item,
            currentStock: newStock,
            totalValue: newStock * item.costPrice,
          }
        }
        return item
      }),
    )

    toast({
      title: "Stock Adjusted",
      description: `Stock level updated successfully. Reason: ${reason}`,
    })
  }

  const handlePurchaseOrder = (orderData: any) => {
    if (!hasPermission("purchases.create")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create purchase orders",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would create a purchase order
    toast({
      title: "Purchase Order Created",
      description: `Purchase order for ${orderData.quantity} units has been created`,
    })
  }

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.totalValue, 0)
  const lowStockCount = inventory.filter((item) => item.currentStock <= item.minStockLevel).length
  const outOfStockCount = inventory.filter((item) => item.currentStock === 0).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your stock levels</p>
        </div>
        <div className="flex space-x-2">
          {hasPermission("purchases.create") && (
            <Button variant="outline" onClick={() => setShowPurchaseModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Purchase Order
            </Button>
          )}
          <Button onClick={() => fetchInventory()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-gray-600 mt-1">Products in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
            <p className="text-xs text-gray-600 mt-1">Items below minimum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
            <p className="text-xs text-gray-600 mt-1">Items with zero stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search inventory..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === "all" ? "All Categories" : category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            {filteredInventory.length} of {inventory.length} items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min/Max Levels</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                {hasPermission("inventory.update") && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item)
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-600 font-mono">{item.barcode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.currentStock}</span>
                        {item.currentStock <= item.minStockLevel && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Min: {item.minStockLevel}</div>
                        <div>Max: {item.maxStockLevel}</div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(item.lastRestocked).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${item.totalValue.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">${item.costPrice} each</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    {hasPermission("inventory.update") && (
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item)
                            setShowStockModal(true)
                          }}
                        >
                          Adjust Stock
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredInventory.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals - Only show if user has permissions */}
      {hasPermission("inventory.update") && (
        <StockAdjustmentModal
          isOpen={showStockModal}
          onClose={() => {
            setShowStockModal(false)
            setSelectedItem(null)
          }}
          onAdjust={handleStockAdjustment}
          item={selectedItem}
        />
      )}

      {hasPermission("purchases.create") && (
        <PurchaseOrderModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onSubmit={handlePurchaseOrder}
        />
      )}
    </div>
  )
}
