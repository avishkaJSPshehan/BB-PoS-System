"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SupplierModal } from "@/components/suppliers/SupplierModal"
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Truck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  status: "active" | "inactive"
  productsSupplied: string[]
  totalOrders: number
  lastOrderDate: string
  createdAt: string
}

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredSuppliers(filtered)
    } else {
      setFilteredSuppliers(suppliers)
    }
  }, [suppliers, searchTerm])

  const fetchSuppliers = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockSuppliers: Supplier[] = [
        {
          id: "1",
          name: "Apple Inc.",
          contactPerson: "John Smith",
          email: "orders@apple.com",
          phone: "+1-800-275-2273",
          address: "One Apple Park Way",
          city: "Cupertino, CA",
          country: "USA",
          status: "active",
          productsSupplied: ["iPhone 15 Pro", "MacBook Air M3", "Apple Watch Series 9"],
          totalOrders: 45,
          lastOrderDate: "2024-01-20",
          createdAt: "2023-01-15",
        },
        {
          id: "2",
          name: "Samsung Electronics",
          contactPerson: "Kim Lee",
          email: "b2b@samsung.com",
          phone: "+82-2-2255-0114",
          address: "129 Samsung-ro",
          city: "Seoul",
          country: "South Korea",
          status: "active",
          productsSupplied: ["Samsung Galaxy S24", "Samsung Earbuds"],
          totalOrders: 32,
          lastOrderDate: "2024-01-18",
          createdAt: "2023-02-10",
        },
        {
          id: "3",
          name: "Nike Inc.",
          contactPerson: "Michael Johnson",
          email: "wholesale@nike.com",
          phone: "+1-503-671-6453",
          address: "One Bowerman Drive",
          city: "Beaverton, OR",
          country: "USA",
          status: "active",
          productsSupplied: ["Nike Air Max", "Nike Running Shoes"],
          totalOrders: 28,
          lastOrderDate: "2024-01-15",
          createdAt: "2023-03-05",
        },
        {
          id: "4",
          name: "Levi Strauss & Co.",
          contactPerson: "Sarah Wilson",
          email: "orders@levi.com",
          phone: "+1-415-501-6000",
          address: "1155 Battery Street",
          city: "San Francisco, CA",
          country: "USA",
          status: "inactive",
          productsSupplied: ["Levi's 501 Jeans", "Denim Jackets"],
          totalOrders: 15,
          lastOrderDate: "2023-12-10",
          createdAt: "2023-04-20",
        },
      ]

      setSuppliers(mockSuppliers)
      setFilteredSuppliers(mockSuppliers)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSupplier = () => {
    if (!hasPermission("suppliers.create")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to add suppliers",
        variant: "destructive",
      })
      return
    }
    setEditingSupplier(null)
    setShowModal(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    if (!hasPermission("suppliers.update")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit suppliers",
        variant: "destructive",
      })
      return
    }
    setEditingSupplier(supplier)
    setShowModal(true)
  }

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!hasPermission("suppliers.delete")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete suppliers",
        variant: "destructive",
      })
      return
    }

    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        setSuppliers((prev) => prev.filter((s) => s.id !== supplierId))
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete supplier",
          variant: "destructive",
        })
      }
    }
  }

  const handleSupplierSave = (supplierData: any) => {
    if (editingSupplier) {
      setSuppliers((prev) => prev.map((s) => (s.id === editingSupplier.id ? { ...s, ...supplierData } : s)))
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      })
    } else {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...supplierData,
        totalOrders: 0,
        lastOrderDate: "",
        createdAt: new Date().toISOString().split("T")[0],
      }
      setSuppliers((prev) => [...prev, newSupplier])
      toast({
        title: "Success",
        description: "Supplier added successfully",
      })
    }
    setShowModal(false)
  }

  const activeSuppliers = suppliers.filter((s) => s.status === "active").length
  const totalOrders = suppliers.reduce((sum, s) => sum + s.totalOrders, 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600 mt-1">Manage your suppliers and vendor relationships</p>
        </div>
        {hasPermission("suppliers.create") && (
          <Button onClick={handleAddSupplier}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-gray-600 mt-1">Registered suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
            <p className="text-xs text-gray-600 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-gray-600 mt-1">All time orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search suppliers..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
          <CardDescription>
            {filteredSuppliers.length} of {suppliers.length} suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-gray-600">{supplier.contactPerson}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {supplier.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {supplier.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-1 h-3 w-3" />
                      <div>
                        <div>{supplier.city}</div>
                        <div className="text-gray-600">{supplier.country}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {supplier.productsSupplied.slice(0, 2).map((product, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                      {supplier.productsSupplied.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{supplier.productsSupplied.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.totalOrders}</div>
                      <div className="text-sm text-gray-600">Last: {supplier.lastOrderDate || "Never"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={supplier.status === "active" ? "default" : "secondary"}>{supplier.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {hasPermission("suppliers.update") && (
                        <Button variant="outline" size="sm" onClick={() => handleEditSupplier(supplier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission("suppliers.delete") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <SupplierModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSupplierSave}
        supplier={editingSupplier}
      />
    </div>
  )
}
