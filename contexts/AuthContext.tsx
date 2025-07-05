"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "admin" | "cashier" | "inventory_manager" | "viewer"

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  hasPermission: (permission: string) => boolean
}

interface LoginCredentials {
  username: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Updated role permissions mapping - Viewer can only view reports
const rolePermissions = {
  admin: [
    "products.create",
    "products.update",
    "products.delete",
    "products.view",
    "users.create",
    "users.update",
    "users.delete",
    "users.view",
    "suppliers.create",
    "suppliers.update",
    "suppliers.delete",
    "suppliers.view",
    "reports.view",
    "dashboard.view",
    "inventory.view",
  ],
  cashier: ["pos.access", "sales.create", "sales.view"],
  inventory_manager: [
    "products.create",
    "products.update",
    "products.delete",
    "products.view",
    "inventory.view",
    "inventory.update",
    "purchases.create",
    "purchases.view",
    "suppliers.view",
    "reports.view",
    "dashboard.view",
  ],
  viewer: ["reports.view"], // Viewer can ONLY view reports
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("pos_token")
    const userData = localStorage.getItem("pos_user")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        localStorage.removeItem("pos_token")
        localStorage.removeItem("pos_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("pos_token", data.token)
        localStorage.setItem("pos_user", JSON.stringify(data.user))
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("pos_token")
    localStorage.removeItem("pos_user")
    setUser(null)
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    const userPermissions = rolePermissions[user.role] || []
    return userPermissions.includes(permission)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
