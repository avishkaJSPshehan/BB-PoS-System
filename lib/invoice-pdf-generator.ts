interface InvoiceData {
  id: string
  timestamp: string
  cashier: string
  items: Array<{
    name: string
    quantity: number
    price: number
    category: string
  }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  paymentAmount: number
  change: number
}

export async function generateInvoicePDF(invoiceData: InvoiceData) {
  // Properly load jsPDF & patch with AutoTable
  const jsPDFLib = await import("jspdf")
  const JsPDF = (jsPDFLib.jsPDF || jsPDFLib.default) as any
  const autoTable = (await import("jspdf-autotable")).default
  autoTable(JsPDF)
  const doc = new JsPDF()

  if (typeof doc.getFontSize !== "function") {
    ;(doc as any).getFontSize = () => doc.internal.getFontSize()
  }

  const pageWidth = doc.internal.pageSize.width
  let yPosition = 20

  // Header
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("INVOICE", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 15

  doc.setFontSize(16)
  doc.text("POS System", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 8

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Point of Sale & Inventory Management", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 20

  // Invoice Details
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(`Invoice #: ${invoiceData.id}`, 20, yPosition)
  doc.text(`Date: ${new Date(invoiceData.timestamp).toLocaleDateString()}`, pageWidth - 20, yPosition, {
    align: "right",
  })
  yPosition += 8

  doc.setFont("helvetica", "normal")
  doc.text(`Time: ${new Date(invoiceData.timestamp).toLocaleTimeString()}`, 20, yPosition)
  doc.text(`Cashier: ${invoiceData.cashier}`, pageWidth - 20, yPosition, { align: "right" })
  yPosition += 20

  // Items Table
  const itemHeaders = ["Item", "Qty", "Price", "Total"]
  const itemData = invoiceData.items.map((item) => [
    item.name,
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${(item.price * item.quantity).toFixed(2)}`,
  ])
  doc.autoTable({
    startY: yPosition,
    head: [itemHeaders],
    body: itemData,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 80 }, // Item name
      1: { cellWidth: 20, halign: "center" }, // Quantity
      2: { cellWidth: 30, halign: "right" }, // Price
      3: { cellWidth: 30, halign: "right" }, // Total
    },
    margin: { left: 20, right: 20 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 20

  // Totals Section
  const totalsX = pageWidth - 80
  doc.setFont("helvetica", "normal")
  doc.text("Subtotal:", totalsX - 30, yPosition)
  doc.text(`$${invoiceData.subtotal.toFixed(2)}`, totalsX, yPosition, { align: "right" })
  yPosition += 8

  doc.text("Tax:", totalsX - 30, yPosition)
  doc.text(`$${invoiceData.tax.toFixed(2)}`, totalsX, yPosition, { align: "right" })
  yPosition += 8

  // Total line
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("TOTAL:", totalsX - 30, yPosition)
  doc.text(`$${invoiceData.total.toFixed(2)}`, totalsX, yPosition, { align: "right" })
  yPosition += 15

  // Payment Information
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Payment Method: ${invoiceData.paymentMethod.toUpperCase()}`, 20, yPosition)
  yPosition += 8

  doc.text(`Amount Paid: $${invoiceData.paymentAmount.toFixed(2)}`, 20, yPosition)
  yPosition += 8

  if (invoiceData.change > 0) {
    doc.text(`Change: $${invoiceData.change.toFixed(2)}`, 20, yPosition)
    yPosition += 8
  }

  // Footer
  yPosition += 20
  doc.setFontSize(10)
  doc.setFont("helvetica", "italic")
  doc.text("Thank you for your business!", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 6
  doc.text("For support, contact us at support@possystem.com", pageWidth / 2, yPosition, { align: "center" })

  // Save the PDF
  const fileName = `invoice-${invoiceData.id}-${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(fileName)
}
