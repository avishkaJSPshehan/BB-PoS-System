"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { DashboardOverview } from "@/components/dashboard/DashboardOverview"
import { ProductManagement } from "@/components/products/ProductManagement"
import { POSInterface } from "@/components/pos/POSInterface"
import { InventoryManagement } from "@/components/inventory/InventoryManagement"
import { SalesReports } from "@/components/reports/SalesReports"
import { UserManagement } from "@/components/users/UserManagement"
import { SupplierManagement } from "@/components/suppliers/SupplierManagement"

export type ActiveView = "dashboard" | "pos" | "products" | "inventory" | "sales" | "reports" | "users" | "suppliers"

export function Dashboard() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, hasPermission } = useAuth()

  // Redirect users based on their role
  useEffect(() => {
    if (user?.role === "cashier") {
      setActiveView("pos")
    } else if (user?.role === "viewer") {
      setActiveView("reports") // Viewers go directly to reports
    }
  }, [user])

  const renderContent = () => {
    // Check permissions before rendering content
    switch (activeView) {
      case "dashboard":
        return hasPermission("dashboard.view") ? <DashboardOverview /> : <UnauthorizedAccess />
      case "pos":
        return hasPermission("pos.access") ? <POSInterface /> : <UnauthorizedAccess />
      case "products":
        return hasPermission("products.view") ? <ProductManagement /> : <UnauthorizedAccess />
      case "inventory":
        return hasPermission("inventory.view") ? <InventoryManagement /> : <UnauthorizedAccess />
      case "sales":
        return hasPermission("reports.view") ? <SalesReports /> : <UnauthorizedAccess />
      case "reports":
        return hasPermission("reports.view") ? <SalesReports /> : <UnauthorizedAccess />
      case "users":
        return hasPermission("users.view") ? <UserManagement /> : <UnauthorizedAccess />
      case "suppliers":
        return hasPermission("suppliers.view") ? <SupplierManagement /> : <UnauthorizedAccess />
      default:
        // Default view based on role
        if (hasPermission("reports.view")) return <SalesReports />
        if (hasPermission("pos.access")) return <POSInterface />
        if (hasPermission("dashboard.view")) return <DashboardOverview />
        return <UnauthorizedAccess />
    }
  }

  // Add UnauthorizedAccess component
  const UnauthorizedAccess = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this section.</p>
        <p className="text-sm text-gray-500 mt-2">
          {user?.role === "viewer" && "As a viewer, you can only access the Reports section."}
        </p>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
