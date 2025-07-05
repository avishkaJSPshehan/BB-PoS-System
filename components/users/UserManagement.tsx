"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserModal } from "@/components/users/UserModal"
import { Plus, Search, Edit, Trash2, Users, UserCheck, UserX, Shield, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth, type UserRole } from "@/contexts/AuthContext"

interface SystemUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  createdBy: string
}

export function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<SystemUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { toast } = useToast()
  const { hasPermission, user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, selectedRole])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users")

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      console.log("Fetched users:", data) // Debug log

      if (Array.isArray(data)) {
        const formattedUsers = data.map((user) => ({
          ...user,
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never",
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "",
        }))
        setUsers(formattedUsers)
      } else {
        console.error("Users data is not an array:", data)
        setUsers([])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole)
    }

    setFilteredUsers(filtered)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchUsers()
    setIsRefreshing(false)
    toast({
      title: "Refreshed",
      description: "User data has been refreshed",
    })
  }

  const handleAddUser = () => {
    if (!hasPermission("users.create")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to add users",
        variant: "destructive",
      })
      return
    }
    setEditingUser(null)
    setShowModal(true)
  }

  const handleEditUser = (user: SystemUser) => {
    if (!hasPermission("users.update")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit users",
        variant: "destructive",
      })
      return
    }
    setEditingUser(user)
    setShowModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!hasPermission("users.delete")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete users",
        variant: "destructive",
      })
      return
    }

    if (userId === currentUser?.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive",
      })
      return
    }

    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete user")
        }

        await fetchUsers() // Refresh the list
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    if (!hasPermission("users.update")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to modify users",
        variant: "destructive",
      })
      return
    }

    if (userId === currentUser?.id) {
      toast({
        title: "Error",
        description: "You cannot deactivate your own account",
        variant: "destructive",
      })
      return
    }

    try {
      const user = users.find((u) => u.id === userId)
      if (!user) return

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user status")
      }

      await fetchUsers() // Refresh the list
      toast({
        title: "Success",
        description: "User status updated successfully",
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const handleUserSave = async (userData: any) => {
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${editingUser ? "update" : "create"} user`)
      }

      await fetchUsers() // Refresh the list
      setShowModal(false)

      toast({
        title: "Success",
        description: `User ${editingUser ? "updated" : "added"} successfully`,
      })
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${editingUser ? "update" : "add"} user`,
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "cashier":
        return "bg-green-100 text-green-800"
      case "inventory_manager":
        return "bg-blue-100 text-blue-800"
      case "viewer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const activeUsers = users.filter((u) => u.isActive).length
  const adminUsers = users.filter((u) => u.role === "admin").length
  const roles = ["all", "admin", "cashier", "inventory_manager", "viewer"]

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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {hasPermission("users.create") && (
            <Button onClick={handleAddUser}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-gray-600 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <UserCheck className="mr-2 h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <p className="text-xs text-gray-600 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <UserX className="mr-2 h-4 w-4" />
              Inactive Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{users.length - activeUsers}</div>
            <p className="text-xs text-gray-600 mt-1">Deactivated users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Administrators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{adminUsers}</div>
            <p className="text-xs text-gray-600 mt-1">Admin users</p>
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
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {roles.map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                  className="capitalize"
                >
                  {role === "all" ? "All Roles" : role.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedRole !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No users available. Add some users to get started."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{user.username}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.lastLogin}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{user.createdAt}</div>
                        <div className="text-xs text-gray-600">by {user.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {hasPermission("users.update") && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id)}
                              disabled={user.id === currentUser?.id}
                              className={
                                user.isActive
                                  ? "text-red-600 hover:text-red-700"
                                  : "text-green-600 hover:text-green-700"
                              }
                            >
                              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
                        {hasPermission("users.delete") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id}
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
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <UserModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleUserSave} user={editingUser} />
    </div>
  )
}
