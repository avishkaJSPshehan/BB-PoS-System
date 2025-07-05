"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole } from "@/contexts/AuthContext"

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: any) => void
  user?: any
}

export function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "cashier" as UserRole,
    password: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role || "cashier",
        password: "",
      })
    } else {
      setFormData({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "cashier",
        password: "",
      })
    }
  }, [user, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => setFormData((prev) => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password">{user ? "New Password (leave blank to keep current)" : "Password *"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              required={!user}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {user ? "Update User" : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
