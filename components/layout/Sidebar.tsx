"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, Package, Warehouse, BarChart3, Users, Truck, X } from "lucide-react"
import type { ActiveView } from "@/components/dashboard/Dashboard"

interface SidebarProps {
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function Sidebar({ activeView, setActiveView, isOpen, setIsOpen }: SidebarProps) {
  const { hasPermission } = useAuth()

  const menuItems = [
    {
      id: "dashboard" as ActiveView,
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: "dashboard.view",
    },
    {
      id: "pos" as ActiveView,
      label: "Point of Sale",
      icon: ShoppingCart,
      permission: "pos.access",
    },
    {
      id: "products" as ActiveView,
      label: "Products",
      icon: Package,
      permission: "products.view",
    },
    {
      id: "inventory" as ActiveView,
      label: "Inventory",
      icon: Warehouse,
      permission: "inventory.view",
    },
    {
      id: "reports" as ActiveView,
      label: "Reports",
      icon: BarChart3,
      permission: "reports.view",
    },
    {
      id: "suppliers" as ActiveView,
      label: "Suppliers",
      icon: Truck,
      permission: "suppliers.view",
    },
    {
      id: "users" as ActiveView,
      label: "Users",
      icon: Users,
      permission: "users.view",
    },
  ]

  const visibleItems = menuItems.filter((item) => hasPermission(item.permission))

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">POS System</h1>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    activeView === item.id && "bg-blue-600 text-white hover:bg-blue-700",
                  )}
                  onClick={() => {
                    setActiveView(item.id)
                    setIsOpen(false) // Close sidebar on mobile after selection
                  }}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* Role indicator at bottom of sidebar */}
        <div className="absolute bottom-4 left-3 right-3">
          <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
            {visibleItems.length === 1 && visibleItems[0].id === "reports" && <span>Viewer Mode - Reports Only</span>}
          </div>
        </div>
      </div>
    </>
  )
}
