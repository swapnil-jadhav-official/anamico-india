import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

export interface InvoiceItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
  hsnCode?: string;
  igstPercent?: number;
  igstAmount?: number;
}

export interface InvoiceData {
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGSTIN?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  placeOfSupply?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  status: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

// Helper function to format currency in Indian format
function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Helper function to format numbers
function formatNumber(num: number): string {
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper function to convert number to words (Indian format)
function numberToWords(amount: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (amount === 0) return 'Zero';

  const crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  const lakh = Math.floor(amount / 100000);
  amount %= 100000;
  const thousand = Math.floor(amount / 1000);
  amount %= 1000;
  const hundred = Math.floor(amount / 100);
  amount %= 100;
  const ten = Math.floor(amount / 10);
  const unit = amount % 10;

  let words = '';

  if (crore > 0) {
    words += convertTwoDigits(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += units[hundred] + ' Hundred ';
  }
  if (ten > 0 || unit > 0) {
    if (ten === 1) {
      words += teens[unit] + ' ';
    } else {
      if (ten > 0) words += tens[ten] + ' ';
      if (unit > 0) words += units[unit] + ' ';
    }
  }

  function convertTwoDigits(num: number): string {
    const t = Math.floor(num / 10);
    const u = num % 10;
    if (t === 1) {
      return teens[u];
    } else {
      return (tens[t] + (u > 0 ? ' ' + units[u] : '')).trim();
    }
  }

  return words.trim() + ' Only';
}

// Determine tax type based on customer state
function getTaxType(customerState: string): { type: 'IGST' | 'CGST/SGST', rate: number } {
  const companyState = 'Delhi';
  const isInterState = customerState.toLowerCase() !== companyState.toLowerCase();

  return {
    type: isInterState ? 'IGST' : 'CGST/SGST',
    rate: 18
  };
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  try {
    // Read the HTML template
    const templatePath = path.join(process.cwd(), 'lib', 'invoice-template.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    // Determine tax type
    const taxInfo = getTaxType(data.shippingState);
    const taxType = taxInfo.type;
    const taxRate = taxInfo.rate;

    // Prepare data for template
    const invoiceNumber = data.invoiceNumber || `INV-${data.orderNumber}`;
    const invoiceDate = (data.invoiceDate || data.orderDate).toLocaleDateString('en-IN');
    const dueDate = (data.dueDate || data.orderDate).toLocaleDateString('en-IN');

    // Format customer address
    const customerAddress = `${data.shippingAddress}, ${data.shippingCity} ${data.shippingPincode}, ${data.shippingState}, India`;

    // Generate items rows HTML
    const itemsRowsHtml = data.items.map((item, index) => {
      const itemSubtotal = item.quantity * item.price;
      const itemTotal = item.total || itemSubtotal;

      return `
  <tr>
    <td class="center">${index + 1}</td>
    <td>
      <b>${item.productName}</b><br>
      ${item.productName}
    </td>
    <td>${item.hsnCode || '85444292'}</td>
    <td class="right">${formatNumber(item.quantity)}</td>
    <td class="right">${item.price.toFixed(2)}</td>
    <td class="center">${taxRate}%</td>
    <td class="right">${formatCurrency(itemTotal)}</td>
  </tr>`;
    }).join('');

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = data.tax || (subtotal * taxRate / 100);
    const total = subtotal + taxAmount;
    const balanceDue = data.dueAmount || total;

    // Convert amount to words
    const amountInWords = `Indian Rupee ${numberToWords(Math.floor(total))}`;

    // Place of supply with state code
    const stateCode = data.placeOfSupply || `${data.shippingState}`;

    // Get logo path - convert to absolute file path for Puppeteer
    const logoPath = path.join(process.cwd(), 'public', 'images', 'anamico-logo.jpeg');
    const logoBase64 = fs.existsSync(logoPath)
      ? `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString('base64')}`
      : '';

    // Replace placeholders in template
    const replacements: Record<string, string> = {
      '{{LOGO_PATH}}': logoBase64,
      '{{COMPANY_ADDRESS}}': 'WZ-663, Office No-204, Near Punjabi Bagh Apartment, Madipur, Delhi 110063, India',
      '{{COMPANY_GSTIN}}': '07AAXCA2423P1Z3',
      '{{INVOICE_NUMBER}}': invoiceNumber,
      '{{INVOICE_DATE}}': invoiceDate,
      '{{PAYMENT_TERMS}}': 'Due on Receipt',
      '{{DUE_DATE}}': dueDate,
      '{{PLACE_OF_SUPPLY}}': stateCode,
      '{{CUSTOMER_NAME}}': data.customerName,
      '{{CUSTOMER_ADDRESS}}': customerAddress,
      '{{CUSTOMER_GSTIN}}': data.customerGSTIN || 'N/A',
      '{{TAX_TYPE}}': taxType,
      '{{TAX_RATE}}': taxRate.toString(),
      '{{ITEMS_ROWS}}': itemsRowsHtml,
      '{{SUB_TOTAL}}': formatCurrency(subtotal),
      '{{TAX_AMOUNT}}': formatCurrency(taxAmount),
      '{{TOTAL_AMOUNT}}': formatCurrency(total),
      '{{BALANCE_DUE}}': formatCurrency(balanceDue),
      '{{AMOUNT_IN_WORDS}}': amountInWords,
      '{{BANK_ACCOUNT_NAME}}': 'ANAMICO INDIA PRIVATE LIMITED',
      '{{BANK_NAME}}': 'HDFC BANK',
      '{{BANK_ACCOUNT_NUMBER}}': '50200080572373',
      '{{BANK_IFSC}}': 'HDFC0000091',
      '{{BANK_BRANCH}}': 'Punjabi Bagh, Delhi'
    };

    // Perform replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      htmlTemplate = htmlTemplate.replace(new RegExp(placeholder, 'g'), value);
    });

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw new Error(`Failed to generate invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getInvoiceFilename(orderNumber: string): string {
  return `Invoice-${orderNumber}.pdf`;
}
