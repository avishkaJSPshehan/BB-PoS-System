"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, TrendingUp, DollarSign, ShoppingCart, Users, Filter, FileText } from "lucide-react"
import { SalesChart, TopProductsChart } from "@/components/charts"
import { useToast } from "@/hooks/use-toast"
import { generateSalesReportPDF } from "@/lib/pdf-generator"

interface SaleTransaction {
  id: string
  date: string
  time: string
  cashier: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  customerName?: string
}

interface DailySummary {
  date: string
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  cashSales: number
  cardSales: number
  topProduct: string
}

export function SalesReports() {
  const [transactions, setTransactions] = useState<SaleTransaction[]>([])
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<SaleTransaction[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedCashier, setSelectedCashier] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchReportsData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, dateFrom, dateTo, selectedCashier, selectedPaymentMethod])

  const fetchReportsData = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock transaction data
      const mockTransactions: SaleTransaction[] = [
        {
          id: "TXN001",
          date: "2024-01-25",
          time: "10:30 AM",
          cashier: "John Doe",
          items: [
            { name: "iPhone 15 Pro", quantity: 1, price: 999.99, total: 999.99 },
            { name: "Phone Case", quantity: 1, price: 29.99, total: 29.99 },
          ],
          subtotal: 1029.98,
          tax: 103.0,
          discount: 0,
          total: 1132.98,
          paymentMethod: "card",
          customerName: "Alice Johnson",
        },
        {
          id: "TXN002",
          date: "2024-01-25",
          time: "11:15 AM",
          cashier: "Jane Smith",
          items: [{ name: "Nike Air Max", quantity: 2, price: 129.99, total: 259.98 }],
          subtotal: 259.98,
          tax: 26.0,
          discount: 25.99,
          total: 259.99,
          paymentMethod: "cash",
        },
        {
          id: "TXN003",
          date: "2024-01-24",
          time: "2:45 PM",
          cashier: "John Doe",
          items: [{ name: "MacBook Air M3", quantity: 1, price: 1299.99, total: 1299.99 }],
          subtotal: 1299.99,
          tax: 130.0,
          discount: 0,
          total: 1429.99,
          paymentMethod: "card",
        },
        {
          id: "TXN004",
          date: "2024-01-24",
          time: "4:20 PM",
          cashier: "Jane Smith",
          items: [
            { name: "Levi's Jeans", quantity: 3, price: 79.99, total: 239.97 },
            { name: "T-Shirt", quantity: 2, price: 24.99, total: 49.98 },
          ],
          subtotal: 289.95,
          tax: 29.0,
          discount: 14.5,
          total: 304.45,
          paymentMethod: "cash",
        },
      ]

      // Mock daily summaries
      const mockDailySummaries: DailySummary[] = [
        {
          date: "2024-01-25",
          totalSales: 1392.97,
          totalTransactions: 2,
          averageTransaction: 696.49,
          cashSales: 259.99,
          cardSales: 1132.98,
          topProduct: "iPhone 15 Pro",
        },
        {
          date: "2024-01-24",
          totalSales: 1734.44,
          totalTransactions: 2,
          averageTransaction: 867.22,
          cashSales: 304.45,
          cardSales: 1429.99,
          topProduct: "MacBook Air M3",
        },
      ]

      setTransactions(mockTransactions)
      setDailySummaries(mockDailySummaries)
      setFilteredTransactions(mockTransactions)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to load reports data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    if (dateFrom) {
      filtered = filtered.filter((t) => t.date >= dateFrom)
    }

    if (dateTo) {
      filtered = filtered.filter((t) => t.date <= dateTo)
    }

    if (selectedCashier !== "all") {
      filtered = filtered.filter((t) => t.cashier === selectedCashier)
    }

    if (selectedPaymentMethod !== "all") {
      filtered = filtered.filter((t) => t.paymentMethod === selectedPaymentMethod)
    }

    setFilteredTransactions(filtered)
  }

  const exportToCSV = () => {
    const headers = ["Transaction ID", "Date", "Time", "Cashier", "Items", "Total", "Payment Method"]
    const csvData = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.time,
      t.cashier,
      t.items.map((item) => `${item.name} (${item.quantity})`).join("; "),
      t.total.toFixed(2),
      t.paymentMethod,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Sales report has been exported to CSV",
    })
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const reportData = {
        transactions: filteredTransactions,
        dailySummaries,
        filters: {
          dateFrom,
          dateTo,
          cashier: selectedCashier,
          paymentMethod: selectedPaymentMethod,
        },
        summary: {
          totalSales,
          totalTransactions,
          averageTransaction,
          cashiers: cashiers.length,
        },
      }

      await generateSalesReportPDF(reportData)

      toast({
        title: "PDF Export Successful",
        description: "Sales report has been exported to PDF",
      })
    } catch (error) {
      console.error("PDF export error:", error)
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0)
  const totalTransactions = filteredTransactions.length
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0
  const cashiers = Array.from(new Set(transactions.map((t) => t.cashier)))

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
          <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive sales analytics and reporting</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={exportToPDF} disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            {isExporting ? "Generating PDF..." : "Export PDF"}
          </Button>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">Filtered period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-gray-600 mt-1">Total transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Average Sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageTransaction.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Active Cashiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashiers.length}</div>
            <p className="text-xs text-gray-600 mt-1">Staff members</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="daily">Daily Summary</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="cashier">Cashier</Label>
                  <Select value={selectedCashier} onValueChange={setSelectedCashier}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Cashiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cashiers</SelectItem>
                      {cashiers.map((cashier) => (
                        <SelectItem key={cashier} value={cashier}>
                          {cashier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment">Payment Method</Label>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono">{transaction.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.date}</div>
                          <div className="text-sm text-gray-600">{transaction.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.cashier}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {transaction.items.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              {item.name} × {item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.paymentMethod === "cash" ? "default" : "secondary"}>
                          {transaction.paymentMethod.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">${transaction.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Summary</CardTitle>
              <CardDescription>Daily performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Avg. Transaction</TableHead>
                    <TableHead>Cash Sales</TableHead>
                    <TableHead>Card Sales</TableHead>
                    <TableHead>Top Product</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySummaries.map((summary) => (
                    <TableRow key={summary.date}>
                      <TableCell className="font-medium">{summary.date}</TableCell>
                      <TableCell>${summary.totalSales.toFixed(2)}</TableCell>
                      <TableCell>{summary.totalTransactions}</TableCell>
                      <TableCell>${summary.averageTransaction.toFixed(2)}</TableCell>
                      <TableCell>${summary.cashSales.toFixed(2)}</TableCell>
                      <TableCell>${summary.cardSales.toFixed(2)}</TableCell>
                      <TableCell>{summary.topProduct}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales for the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products this month</CardDescription>
              </CardHeader>
              <CardContent>
                <TopProductsChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
