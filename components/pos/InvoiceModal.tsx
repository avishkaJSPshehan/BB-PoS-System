"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Mail } from "lucide-react"
import { generateInvoicePDF } from "@/lib/invoice-pdf-generator"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  saleData: any
}

export function InvoiceModal({ isOpen, onClose, saleData }: InvoiceModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const { toast } = useToast()

  if (!saleData) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    setIsGeneratingPDF(true)
    try {
      await generateInvoicePDF(saleData)
      toast({
        title: "PDF Generated",
        description: "Invoice has been downloaded as PDF",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleEmail = () => {
    // In a real app, this would open email modal
    toast({
      title: "Email Feature",
      description: "Email functionality would be implemented here",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6" id="invoice-content">
          {/* Invoice Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">POS System</h1>
            <p className="text-gray-600">Point of Sale & Inventory Management</p>
            <p className="text-sm text-gray-500 mt-2">
              Invoice #{saleData.id} | {new Date(saleData.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Sale Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Sale Information</h3>
              <p>
                <span className="text-gray-600">Invoice ID:</span> {saleData.id}
              </p>
              <p>
                <span className="text-gray-600">Date:</span> {new Date(saleData.timestamp).toLocaleDateString()}
              </p>
              <p>
                <span className="text-gray-600">Time:</span> {new Date(saleData.timestamp).toLocaleTimeString()}
              </p>
              <p>
                <span className="text-gray-600">Cashier:</span> {saleData.cashier}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
              <p>
                <span className="text-gray-600">Method:</span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {saleData.paymentMethod}
                </Badge>
              </p>
              <p>
                <span className="text-gray-600">Amount Paid:</span> ${(saleData.paymentAmount ?? 0).toFixed(2)}
              </p>
              {saleData.change > 0 && (
                <p>
                  <span className="text-gray-600">Change:</span> ${saleData.change.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Items Purchased</h3>
            <div className="space-y-2">
              {saleData.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${saleData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax:</span>
              <span>${saleData.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${saleData.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t pt-4">
            <p>Thank you for your business!</p>
            <p>For support, contact us at support@possystem.com</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 no-print">
          <Button variant="outline" onClick={handlePrint} className="flex-1 bg-transparent">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isGeneratingPDF}
            className="flex-1 bg-transparent"
          >
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
          <Button variant="outline" onClick={handleEmail} className="flex-1 bg-transparent">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
