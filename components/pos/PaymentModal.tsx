"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { CreditCard, DollarSign, Smartphone } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: (paymentData: any) => void
  total: number
}

export function PaymentModal({ isOpen, onClose, onPaymentComplete, total }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const change = Number.parseFloat(cashReceived) - total
  const isValidCashPayment = paymentMethod === "cash" && Number.parseFloat(cashReceived) >= total

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const paymentData = {
      method: paymentMethod,
      amount: paymentMethod === "cash" ? Number.parseFloat(cashReceived) : total,
      change: paymentMethod === "cash" ? change : 0,
      timestamp: new Date().toISOString(),
    }

    onPaymentComplete(paymentData)
    setIsProcessing(false)

    // Reset form
    setCashReceived("")
    setPaymentMethod("cash")
  }

  const paymentMethods = [
    {
      id: "cash",
      label: "Cash",
      icon: DollarSign,
      description: "Pay with cash",
    },
    {
      id: "card",
      label: "Credit/Debit Card",
      icon: CreditCard,
      description: "Pay with card",
    },
    {
      id: "digital",
      label: "Digital Wallet",
      icon: Smartphone,
      description: "Apple Pay, Google Pay, etc.",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total Amount */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</p>
          </div>

          {/* Payment Method Selection */}
          <div>
            <Label className="text-base font-medium">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div className="flex items-center space-x-3 flex-1">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <Label htmlFor={method.id} className="font-medium cursor-pointer">
                          {method.label}
                        </Label>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Cash Payment Input */}
          {paymentMethod === "cash" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="cashReceived">Cash Received</Label>
                <Input
                  id="cashReceived"
                  type="number"
                  step="0.01"
                  min={total}
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="text-lg"
                />
              </div>

              {cashReceived && Number.parseFloat(cashReceived) >= total && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium">Change:</span>
                    <span className="text-green-800 font-bold text-lg">${change.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {cashReceived && Number.parseFloat(cashReceived) < total && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-red-800 text-sm">
                    Insufficient amount. Need ${(total - Number.parseFloat(cashReceived)).toFixed(2)} more.
                  </p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={paymentMethod === "cash" ? !isValidCashPayment : false}
              className="flex-1"
              loading={isProcessing}
            >
              {isProcessing ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
