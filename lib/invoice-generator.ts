import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface InvoiceItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceData {
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  status: string;
  invoiceNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
}

/**
 * Generate PDF invoice buffer
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header with Company Info
      doc
        .fontSize(24)
        .fillColor('#1e3a8a')
        .text('ANAMICO INDIA', 50, 50);

      doc
        .fontSize(10)
        .fillColor('#666666')
        .text('ANAMICO India Private Limited', 50, 80)
        .text('UIDAI Certified Partner', 50, 95)
        .text('Email: info@anamicoindia.com', 50, 110)
        .text('Phone: +91 9818424815', 50, 125);

      // Invoice Title
      doc
        .fontSize(20)
        .fillColor('#000000')
        .text(
          data.paymentStatus === 'paid' ? 'TAX INVOICE' : 'PROFORMA INVOICE',
          400,
          50,
          { align: 'right' }
        );

      // Invoice Number and Date
      const invoiceNum = data.invoiceNumber || `INV-${data.orderNumber}`;
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text(`Invoice No: ${invoiceNum}`, 400, 80, { align: 'right' })
        .text(`Order No: ${data.orderNumber}`, 400, 95, { align: 'right' })
        .text(`Date: ${data.orderDate.toLocaleDateString('en-IN')}`, 400, 110, { align: 'right' });

      // Status Badge
      const statusY = 125;
      let statusColor = '#666666';
      let statusText = data.status.toUpperCase();

      if (data.status === 'delivered') {
        statusColor = '#16a34a';
        statusText = 'DELIVERED';
      } else if (data.status === 'shipped') {
        statusColor = '#2563eb';
        statusText = 'SHIPPED';
      } else if (data.status === 'accepted') {
        statusColor = '#16a34a';
        statusText = 'CONFIRMED';
      }

      doc
        .fillColor(statusColor)
        .fontSize(9)
        .text(statusText, 400, statusY, { align: 'right' });

      // Line separator
      doc
        .moveTo(50, 155)
        .lineTo(545, 155)
        .stroke('#cccccc');

      // Customer Information
      let yPos = 175;
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Bill To:', 50, yPos);

      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(data.customerName, 50, yPos + 20)
        .text(data.customerEmail, 50, yPos + 35)
        .text(data.customerPhone, 50, yPos + 50);

      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Ship To:', 300, yPos);

      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(data.shippingAddress, 300, yPos + 20, { width: 245 })
        .text(`${data.shippingCity}, ${data.shippingState} ${data.shippingPincode}`, 300, yPos + 50);

      // Table Header
      yPos += 100;
      doc
        .moveTo(50, yPos)
        .lineTo(545, yPos)
        .stroke('#cccccc');

      yPos += 10;
      doc
        .fontSize(10)
        .fillColor('#ffffff')
        .rect(50, yPos, 495, 25)
        .fill('#1e3a8a');

      doc
        .fillColor('#ffffff')
        .text('Item', 60, yPos + 8)
        .text('Qty', 340, yPos + 8)
        .text('Price', 395, yPos + 8)
        .text('Amount', 480, yPos + 8, { align: 'right' });

      yPos += 25;

      // Table Items
      data.items.forEach((item, index) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
        doc
          .rect(50, yPos, 495, 30)
          .fill(bgColor);

        doc
          .fillColor('#333333')
          .fontSize(9)
          .text(item.productName, 60, yPos + 10, { width: 270 })
          .text(item.quantity.toString(), 340, yPos + 10)
          .text(`₹${item.price.toLocaleString('en-IN')}`, 395, yPos + 10)
          .text(`₹${item.total.toLocaleString('en-IN')}`, 480, yPos + 10, { align: 'right' });

        yPos += 30;
      });

      // Summary Section
      yPos += 20;
      const summaryX = 350;

      doc
        .fontSize(10)
        .fillColor('#666666')
        .text('Subtotal:', summaryX, yPos)
        .text(`₹${data.subtotal.toLocaleString('en-IN')}`, 480, yPos, { align: 'right' });

      yPos += 20;
      doc
        .text('Tax (18% GST):', summaryX, yPos)
        .text(`₹${data.tax.toLocaleString('en-IN')}`, 480, yPos, { align: 'right' });

      yPos += 20;
      doc
        .text('Shipping:', summaryX, yPos)
        .fillColor('#16a34a')
        .text('FREE', 480, yPos, { align: 'right' });

      yPos += 5;
      doc
        .moveTo(summaryX, yPos)
        .lineTo(545, yPos)
        .stroke('#cccccc');

      yPos += 10;
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Total Amount:', summaryX, yPos)
        .text(`₹${data.total.toLocaleString('en-IN')}`, 480, yPos, { align: 'right' });

      // Payment Information
      yPos += 30;
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text('Paid Amount:', summaryX, yPos)
        .fillColor('#16a34a')
        .text(`₹${data.paidAmount.toLocaleString('en-IN')}`, 480, yPos, { align: 'right' });

      if (data.dueAmount > 0) {
        yPos += 20;
        doc
          .fillColor('#666666')
          .text('Due Amount:', summaryX, yPos)
          .fillColor('#dc2626')
          .text(`₹${data.dueAmount.toLocaleString('en-IN')}`, 480, yPos, { align: 'right' });
      }

      // Delivery Information (if delivered)
      if (data.deliveredAt) {
        yPos += 40;
        doc
          .fontSize(11)
          .fillColor('#16a34a')
          .text(`✓ Delivered on ${data.deliveredAt.toLocaleDateString('en-IN')}`, 50, yPos);
      } else if (data.shippedAt) {
        yPos += 40;
        doc
          .fontSize(11)
          .fillColor('#2563eb')
          .text(`→ Shipped on ${data.shippedAt.toLocaleDateString('en-IN')}`, 50, yPos);
      }

      // Footer
      const footerY = 750;
      doc
        .moveTo(50, footerY)
        .lineTo(545, footerY)
        .stroke('#cccccc');

      doc
        .fontSize(9)
        .fillColor('#666666')
        .text('Terms & Conditions:', 50, footerY + 10)
        .fontSize(8)
        .text('1. Payment terms as agreed', 50, footerY + 25)
        .text('2. Goods once sold will not be taken back', 50, footerY + 38)
        .text('3. Subject to Delhi jurisdiction', 50, footerY + 51);

      doc
        .fontSize(8)
        .text('For ANAMICO India Private Limited', 400, footerY + 30, { align: 'right' })
        .text('Authorized Signatory', 400, footerY + 60, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get invoice filename
 */
export function getInvoiceFilename(orderNumber: string): string {
  return `Invoice-${orderNumber}.pdf`;
}
