import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Transaction {
  date: string;
  merchant?: string;
  category?: { name?: string };
  amount: string | number;
  isFraud?: boolean;
  location?: string;
}

/**
 * Export transactions as a downloadable CSV file.
 */
export function exportAsCSV(transactions: Transaction[], filename = "fintellix_transactions") {
  const headers = ["Date", "Merchant", "Category", "Amount (₹)", "Location", "Status"];
  
  const rows = transactions.map((tx) => [
    new Date(tx.date).toLocaleDateString("en-IN"),
    tx.merchant || "Unknown",
    tx.category?.name || "Uncategorized",
    Number(tx.amount).toFixed(2),
    tx.location || "-",
    tx.isFraud ? "Suspicious" : "Safe",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export transactions as a styled PDF document.
 */
export function exportAsPDF(transactions: Transaction[], filename = "fintellix_transactions") {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(14, 165, 233); // cyan-500
  doc.text("Fintellix", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Transaction Report", 14, 28);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 34);
  doc.text(`Total Transactions: ${transactions.length}`, 14, 40);
  
  const total = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  doc.text(`Total Expenses: ₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 46);

  // Table
  const tableData = transactions.map((tx) => [
    new Date(tx.date).toLocaleDateString("en-IN"),
    tx.merchant || "Unknown",
    tx.category?.name || "Uncategorized",
    `₹${Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    tx.isFraud ? "⚠ Suspicious" : "Safe",
  ]);

  autoTable(doc, {
    startY: 54,
    head: [["Date", "Merchant", "Category", "Amount", "Status"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],   // slate-900
      textColor: [14, 165, 233], // cyan-500
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [51, 65, 85],   // slate-700
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249], // slate-100
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
}
