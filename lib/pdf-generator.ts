interface ReportData {
  transactions: Array<{
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
  }>
  dailySummaries: Array<{
    date: string
    totalSales: number
    totalTransactions: number
    averageTransaction: number
    cashSales: number
    cardSales: number
    topProduct: string
  }>
  filters: {
    dateFrom: string
    dateTo: string
    cashier: string
    paymentMethod: string
  }
  summary: {
    totalSales: number
    totalTransactions: number
    averageTransaction: number
    cashiers: number
  }
}

export async function generateSalesReportPDF(data: ReportData) {
  // ---- load jsPDF & patch AutoTable safely ----
  const jsPDFLib = await import("jspdf")
  const JsPDF = (jsPDFLib.jsPDF || jsPDFLib.default) as any // works for every build
  const autoTable = (await import("jspdf-autotable")).default
  autoTable(JsPDF) // MUST happen before `new JsPDF()`
  const doc = new JsPDF()

  // Fallback for very old builds where getFontSize isn’t preset
  if (typeof doc.getFontSize !== "function") {
    ;(doc as any).getFontSize = () => doc.internal.getFontSize()
  }

  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let yPosition = 20

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Sales Report", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" })
  yPosition += 20

  // Filters Section
  if (
    data.filters.dateFrom ||
    data.filters.dateTo ||
    data.filters.cashier !== "all" ||
    data.filters.paymentMethod !== "all"
  ) {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Applied Filters:", 20, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    if (data.filters.dateFrom) {
      doc.text(`From Date: ${data.filters.dateFrom}`, 20, yPosition)
      yPosition += 6
    }

    if (data.filters.dateTo) {
      doc.text(`To Date: ${data.filters.dateTo}`, 20, yPosition)
      yPosition += 6
    }

    if (data.filters.cashier !== "all") {
      doc.text(`Cashier: ${data.filters.cashier}`, 20, yPosition)
      yPosition += 6
    }

    if (data.filters.paymentMethod !== "all") {
      doc.text(`Payment Method: ${data.filters.paymentMethod.toUpperCase()}`, 20, yPosition)
      yPosition += 6
    }

    yPosition += 10
  }

  // Summary Section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Summary", 20, yPosition)
  yPosition += 10

  const summaryData = [
    ["Total Sales", `$${data.summary.totalSales.toLocaleString()}`],
    ["Total Transactions", data.summary.totalTransactions.toString()],
    ["Average Transaction", `$${data.summary.averageTransaction.toFixed(2)}`],
    ["Active Cashiers", data.summary.cashiers.toString()],
  ]
  doc.autoTable({
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 20

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage()
    yPosition = 20
  }

  // Daily Summary Section
  if (data.dailySummaries.length > 0) {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Daily Summary", 20, yPosition)
    yPosition += 10

    const dailySummaryHeaders = [
      "Date",
      "Total Sales",
      "Transactions",
      "Avg. Transaction",
      "Cash Sales",
      "Card Sales",
      "Top Product",
    ]
    const dailySummaryData = data.dailySummaries.map((summary) => [
      summary.date,
      `$${summary.totalSales.toFixed(2)}`,
      summary.totalTransactions.toString(),
      `$${summary.averageTransaction.toFixed(2)}`,
      `$${summary.cashSales.toFixed(2)}`,
      `$${summary.cardSales.toFixed(2)}`,
      summary.topProduct,
    ])
    doc.autoTable({
      startY: yPosition,
      head: [dailySummaryHeaders],
      body: dailySummaryData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 20
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage()
    yPosition = 20
  }

  // Transactions Section
  if (data.transactions.length > 0) {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Transaction Details", 20, yPosition)
    yPosition += 10

    const transactionHeaders = ["Transaction ID", "Date", "Time", "Cashier", "Items", "Payment", "Total"]
    const transactionData = data.transactions.map((transaction) => [
      transaction.id,
      transaction.date,
      transaction.time,
      transaction.cashier,
      transaction.items.map((item) => `${item.name} (${item.quantity})`).join(", "),
      transaction.paymentMethod.toUpperCase(),
      `$${transaction.total.toFixed(2)}`,
    ])
    doc.autoTable({
      startY: yPosition,
      head: [transactionHeaders],
      body: transactionData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 },
      columnStyles: {
        4: { cellWidth: 40 }, // Items column wider
      },
    })
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" })
    doc.text("POS & Inventory Management System", 20, pageHeight - 10)
    doc.text(new Date().toLocaleString(), pageWidth - 20, pageHeight - 10, { align: "right" })
  }

  // Save the PDF
  const fileName = `sales-report-${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(fileName)
}
