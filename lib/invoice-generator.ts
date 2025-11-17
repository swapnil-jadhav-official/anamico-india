import PDFDocument from 'pdfkit';
import * as fs from 'fs';

// Workaround for Next.js server environment: prevent PDFKit from loading font files
// This is needed because pdfkit tries to load .afm files from the filesystem,
// which doesn't work in Next.js bundled server environment
const originalReadFileSync = fs.readFileSync;

(fs.readFileSync as any) = function(filePath: any, options?: any) {
  if (typeof filePath === 'string' && filePath.includes('.afm')) {
    // Return a minimal but valid AFM font file format
    console.log('🚫 Blocked font file access:', filePath);
    // Minimal AFM format that PDFKit can parse
    const minimalAFM = `StartFontMetrics 4.1
FontName Helvetica
FullName Helvetica
FamilyName Helvetica
Weight Medium
FontBBox -951 -481 1446 1122
IsFixedPitch false
CharacterSet StandardEncoding
StartCharMetrics 1
C 32 ; WX 278 ; N space ; B 0 0 0 0 ;
EndCharMetrics
EndFontMetrics`;
    // Return as string if encoding is specified, otherwise as Buffer
    if (options === 'utf8' || options === 'utf-8' || (typeof options === 'object' && options?.encoding)) {
      return minimalAFM;
    }
    return Buffer.from(minimalAFM);
  }
  return originalReadFileSync.call(fs, filePath, options);
};

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
 * Fixed to work in Next.js server environment without font file issues
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      // Create PDFDocument - font loading is handled by our fs.readFileSync override
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        autoFirstPage: true,
        bufferPages: false,
      } as any);

      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', (error: Error) => {
        reject(error);
      });

      try {
        // Fixed-width layout with precise positioning
        // All text in plain black (#000000)
        const pageWidth = 595;
        const margin = 50;
        const contentWidth = pageWidth - (margin * 2); // 495

        // Define fixed column positions
        const leftCol = margin; // 50
        const rightCol = 320; // Start of right column

        // Header - Company and Invoice Info (left side - fixed width)
        doc.fontSize(14).fillColor('#000000').text('ANAMICO INDIA', leftCol, 40);
        doc.fontSize(8).fillColor('#000000')
          .text('UIDAI Certified Partner', leftCol, 56)
          .text('Email: info@anamicoindia.com', leftCol, 66)
          .text('Phone: +91 9818424815', leftCol, 76);

        // Invoice Title and Details (right side - fixed positions)
        const invoiceNum = data.invoiceNumber || `INV-${data.orderNumber}`;
        const invoiceType = data.paymentStatus === 'completed' || data.paymentStatus === 'paid' ? 'TAX INVOICE' : 'PROFORMA INVOICE';

        doc.fontSize(12).fillColor('#000000').text(invoiceType, rightCol, 40);
        doc.fontSize(8).fillColor('#000000')
          .text(`Invoice No: ${invoiceNum}`, rightCol, 56)
          .text(`Order No: ${data.orderNumber}`, rightCol, 66)
          .text(`Date: ${data.orderDate.toLocaleDateString('en-IN')}`, rightCol, 76);

        // Separator line
        doc.moveTo(margin, 90).lineTo(pageWidth - margin, 90).stroke('#000000');

        // Customer Info - side by side with fixed columns
        let yPos = 98;

        doc.fontSize(8).fillColor('#000000').text('BILL TO:', leftCol, yPos);
        doc.fontSize(8).fillColor('#000000')
          .text(data.customerName, leftCol, yPos + 12)
          .text(data.customerEmail, leftCol, yPos + 22)
          .text(data.customerPhone, leftCol, yPos + 32);

        doc.fontSize(8).fillColor('#000000').text('SHIP TO:', rightCol, yPos);
        doc.fontSize(8).fillColor('#000000')
          .text(data.shippingAddress, rightCol, yPos + 12, { width: 220 })
          .text(`${data.shippingCity}, ${data.shippingState} ${data.shippingPincode}`, rightCol, yPos + 32);

        // Items Table Header with fixed column positions
        yPos = 145;
        const colItem = leftCol + 5;
        const colQty = 360;
        const colPrice = 410;
        const colAmount = 470;

        doc.moveTo(leftCol, yPos).lineTo(pageWidth - margin, yPos).stroke('#000000');
        yPos += 5;

        doc.fontSize(8).fillColor('#000000')
          .text('ITEM DESCRIPTION', colItem, yPos)
          .text('QTY', colQty, yPos)
          .text('PRICE', colPrice, yPos)
          .text('AMOUNT', colAmount, yPos);

        yPos += 10;
        doc.moveTo(leftCol, yPos).lineTo(pageWidth - margin, yPos).stroke('#000000');

        // Table Items with fixed columns
        yPos += 8;
        data.items.forEach((item, index) => {
          doc.fillColor('#000000').fontSize(8)
            .text(item.productName, colItem, yPos, { width: 290 })
            .text(item.quantity.toString(), colQty, yPos)
            .text(`Rs.${item.price.toLocaleString('en-IN')}`, colPrice, yPos)
            .text(`Rs.${item.total.toLocaleString('en-IN')}`, colAmount, yPos);

          yPos += 18;
        });

        // Bottom line for items
        doc.moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).stroke('#000000');

        // Summary section with fixed columns
        yPos += 10;
        const summaryLabel = 380;
        const summaryValue = 470;

        doc.fontSize(8).fillColor('#000000')
          .text('Subtotal:', summaryLabel, yPos)
          .text(`Rs.${data.subtotal.toLocaleString('en-IN')}`, summaryValue, yPos);

        yPos += 12;
        doc.text('Tax (GST 18%):', summaryLabel, yPos)
          .text(`Rs.${data.tax.toLocaleString('en-IN')}`, summaryValue, yPos);

        yPos += 12;
        doc.text('Shipping:', summaryLabel, yPos)
          .text('FREE', summaryValue, yPos);

        yPos += 3;
        doc.moveTo(summaryLabel, yPos).lineTo(pageWidth - margin, yPos).stroke('#000000');

        yPos += 8;
        doc.fontSize(9).fillColor('#000000')
          .text('TOTAL:', summaryLabel, yPos)
          .text(`Rs.${data.total.toLocaleString('en-IN')}`, summaryValue, yPos);

        // Payment Information
        yPos += 16;
        doc.fontSize(8).fillColor('#000000')
          .text('Amount Paid:', summaryLabel, yPos)
          .text(`Rs.${data.paidAmount.toLocaleString('en-IN')}`, summaryValue, yPos);

        if (data.dueAmount > 0) {
          yPos += 12;
          doc.text('Amount Due:', summaryLabel, yPos)
            .text(`Rs.${data.dueAmount.toLocaleString('en-IN')}`, summaryValue, yPos);
        }

        // Delivery Status (if available)
        yPos += 20;
        if (data.deliveredAt) {
          doc.fontSize(8).fillColor('#000000')
            .text(`Delivered on: ${data.deliveredAt.toLocaleDateString('en-IN')}`, leftCol, yPos);
        } else if (data.shippedAt) {
          doc.fontSize(8).fillColor('#000000')
            .text(`Shipped on: ${data.shippedAt.toLocaleDateString('en-IN')}`, leftCol, yPos);
        }

        // Footer with fixed columns
        const footerY = 740;
        doc.moveTo(leftCol, footerY).lineTo(pageWidth - margin, footerY).stroke('#000000');

        // Terms and conditions on the left
        doc.fontSize(7).fillColor('#000000')
          .text('Terms & Conditions:', leftCol, footerY + 8)
          .text('1. Payment terms as agreed', leftCol, footerY + 18)
          .text('2. Goods once sold will not be taken back', leftCol, footerY + 28)
          .text('3. Subject to Delhi jurisdiction', leftCol, footerY + 38);

        // Signature on the right - fixed position
        doc.fontSize(8).fillColor('#000000')
          .text('For ANAMICO India Private Limited', rightCol, footerY + 20)
          .text('Authorized Signatory', rightCol, footerY + 40);

        doc.end();
      } catch (error) {
        doc.end();
        reject(error);
      }
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
