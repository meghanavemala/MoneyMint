/*
PDF generation utility for creating transaction history reports.
Generates khata-book style PDFs with customer details and transaction history.
*/

import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { CustomerWithTransactions } from '@/actions/finance-actions';

export interface PDFOptions {
  title?: string;
  businessName?: string;
  businessAddress?: string;
  includeBalance?: boolean;
}

export const generateCustomerPDF = async (
  customer: CustomerWithTransactions,
  options: PDFOptions = {}
) => {
  const {
    title = 'Transaction History',
    businessName = 'MoneyMint',
    businessAddress = '',
    includeBalance = true,
  } = options;

  // Create new PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 20;

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - 20) {
      pdf.addPage();
      currentY = 20;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10
  ) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return lines.length * (fontSize * 0.35); // Return height used
  };

  // Header
  pdf.setFillColor(59, 130, 246); // Blue
  pdf.rect(0, 0, pageWidth, 30, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(businessName, 15, 20);

  if (businessAddress) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(businessAddress, 15, 26);
  }

  // Date and title
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, pageWidth - 15, 20, {
    align: 'right',
  });

  currentY = 45;

  // Customer Information Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 15, currentY);
  currentY += 15;

  // Customer details box
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(15, currentY, pageWidth - 30, 35);

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Details', 20, currentY + 10);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  let detailY = currentY + 18;

  pdf.text(`Name: ${customer.name}`, 20, detailY);
  detailY += 5;

  if (customer.phone) {
    pdf.text(`Phone: ${customer.phone}`, 20, detailY);
    detailY += 5;
  }

  if (customer.email) {
    pdf.text(`Email: ${customer.email}`, 20, detailY);
    detailY += 5;
  }

  if (customer.address) {
    const addressHeight = addWrappedText(`Address: ${customer.address}`, 20, detailY, 80);
    detailY += addressHeight;
  }

  // Financial summary in the same box
  if (includeBalance) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Financial Summary', pageWidth / 2 + 10, currentY + 18);

    pdf.setFont('helvetica', 'normal');
    let summaryY = currentY + 26;

    pdf.setTextColor(220, 38, 38); // Red
    pdf.text(
      `Total Credit: ₹${(customer.total_credit || 0).toLocaleString()}`,
      pageWidth / 2 + 10,
      summaryY
    );
    summaryY += 5;

    pdf.setTextColor(34, 197, 94); // Green
    pdf.text(
      `Total Paid: ₹${(customer.total_paid || 0).toLocaleString()}`,
      pageWidth / 2 + 10,
      summaryY
    );
    summaryY += 5;

    pdf.setTextColor(59, 130, 246); // Blue
    pdf.text(`Balance: ₹${(customer.balance || 0).toLocaleString()}`, pageWidth / 2 + 10, summaryY);

    pdf.setTextColor(0, 0, 0); // Reset to black
  }

  currentY += 50;

  // Transaction History Section
  if (customer.transactions.length > 0) {
    checkNewPage(20);

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Transaction History', 15, currentY);
    currentY += 10;

    // Table header
    const tableStartY = currentY;
    const colWidths = [35, 25, 35, 35, 50]; // Date, Type, Amount, Balance, Description
    const colPositions = [15, 50, 75, 110, 145];

    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, currentY, pageWidth - 30, 8, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date', colPositions[0], currentY + 6);
    pdf.text('Type', colPositions[1], currentY + 6);
    pdf.text('Amount', colPositions[2], currentY + 6);
    pdf.text('Running Balance', colPositions[3], currentY + 6);
    pdf.text('Description', colPositions[4], currentY + 6);

    currentY += 12;

    // Sort transactions by date (oldest first) to calculate running balance
    const sortedTransactions = [...customer.transactions].sort(
      (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );

    let runningBalance = 0;

    // Table rows
    pdf.setFont('helvetica', 'normal');
    sortedTransactions.forEach((transaction, index) => {
      checkNewPage(8);

      // Calculate running balance
      if (transaction.type === 'CREDIT') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }

      // Alternate row background
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(15, currentY - 2, pageWidth - 30, 8, 'F');
      }

      // Date
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        format(new Date(transaction.transaction_date), 'dd/MM/yyyy'),
        colPositions[0],
        currentY + 4
      );

      // Type with color
      if (transaction.type === 'CREDIT') {
        pdf.setTextColor(220, 38, 38); // Red
        pdf.text('Credit', colPositions[1], currentY + 4);
      } else {
        pdf.setTextColor(34, 197, 94); // Green
        pdf.text('Payment', colPositions[1], currentY + 4);
      }

      // Amount with color and sign
      const amountText = `${transaction.type === 'CREDIT' ? '+' : '-'}₹${transaction.amount.toLocaleString()}`;
      pdf.text(amountText, colPositions[2], currentY + 4);

      // Running balance
      pdf.setTextColor(0, 0, 0);
      pdf.text(`₹${runningBalance.toLocaleString()}`, colPositions[3], currentY + 4);

      // Description
      const description = transaction.description || 'No description';
      addWrappedText(description, colPositions[4], currentY + 4, 45, 10);

      currentY += 8;
    });

    // Table border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15, tableStartY, pageWidth - 30, currentY - tableStartY);
  } else {
    pdf.setFontSize(12);
    pdf.setTextColor(128, 128, 128);
    pdf.text('No transactions found for this customer.', 15, currentY);
  }

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Generated by MoneyMint App', 15, footerY);
  pdf.text(`Page 1 of ${pdf.internal.pages.length - 1}`, pageWidth - 15, footerY, {
    align: 'right',
  });

  // Generate filename
  const filename = `${customer.name.replace(/[^a-zA-Z0-9]/g, '_')}_transactions_${format(new Date(), 'yyyy_MM_dd')}.pdf`;

  // Save the PDF
  pdf.save(filename);

  return filename;
};

export const generateDailyCollectionPDF = async (
  date: Date,
  transactions: Array<{
    id: string;
    customer_name: string;
    amount: number;
    type: 'CREDIT' | 'PAYMENT';
    description: string | null;
    transaction_date: string;
  }>,
  totalCollection: number,
  options: PDFOptions = {}
) => {
  const { businessName = 'MoneyMint', businessAddress = '' } = options;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 20;

  // Header
  pdf.setFillColor(34, 197, 94); // Green
  pdf.rect(0, 0, pageWidth, 30, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(businessName, 15, 20);

  pdf.setFontSize(12);
  pdf.text('Daily Collection Report', 15, 26);

  // Date
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.text(`Date: ${format(date, 'MMMM dd, yyyy')}`, pageWidth - 15, 20, { align: 'right' });

  currentY = 50;

  // Summary box
  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(34, 197, 94);
  pdf.rect(15, currentY, pageWidth - 30, 25, 'FD');

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(21, 128, 61);
  pdf.text('Total Collection', 20, currentY + 12);
  pdf.text(`₹${totalCollection.toLocaleString()}`, 20, currentY + 20);

  const paymentCount = transactions.filter((t) => t.type === 'PAYMENT').length;
  const creditCount = transactions.filter((t) => t.type === 'CREDIT').length;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Payments: ${paymentCount} | Credits: ${creditCount}`, pageWidth - 20, currentY + 16, {
    align: 'right',
  });

  currentY += 40;

  // Transactions table
  if (transactions.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Transaction Details', 15, currentY);
    currentY += 10;

    // Table header
    const tableStartY = currentY;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, currentY, pageWidth - 30, 8, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Time', 20, currentY + 6);
    pdf.text('Customer', 45, currentY + 6);
    pdf.text('Type', 100, currentY + 6);
    pdf.text('Amount', 130, currentY + 6);
    pdf.text('Description', 160, currentY + 6);

    currentY += 12;

    // Table rows
    pdf.setFont('helvetica', 'normal');
    transactions.forEach((transaction, index) => {
      if (currentY > pageHeight - 30) {
        pdf.addPage();
        currentY = 20;
      }

      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(15, currentY - 2, pageWidth - 30, 8, 'F');
      }

      // Time
      pdf.setTextColor(0, 0, 0);
      pdf.text(format(new Date(transaction.transaction_date), 'HH:mm'), 20, currentY + 4);

      // Customer name
      pdf.text(transaction.customer_name, 45, currentY + 4);

      // Type with color
      if (transaction.type === 'CREDIT') {
        pdf.setTextColor(220, 38, 38);
        pdf.text('Credit', 100, currentY + 4);
      } else {
        pdf.setTextColor(34, 197, 94);
        pdf.text('Payment', 100, currentY + 4);
      }

      // Amount
      pdf.text(`₹${transaction.amount.toLocaleString()}`, 130, currentY + 4);

      // Description
      pdf.setTextColor(0, 0, 0);
      const description = transaction.description || 'No description';
      pdf.text(
        description.substring(0, 25) + (description.length > 25 ? '...' : ''),
        160,
        currentY + 4
      );

      currentY += 8;
    });

    // Table border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15, tableStartY, pageWidth - 30, currentY - tableStartY);
  }

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Generated by MoneyMint App', 15, footerY);
  pdf.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, pageWidth - 15, footerY, {
    align: 'right',
  });

  // Generate filename
  const filename = `daily_collection_${format(date, 'yyyy_MM_dd')}.pdf`;

  // Save the PDF
  pdf.save(filename);

  return filename;
};
