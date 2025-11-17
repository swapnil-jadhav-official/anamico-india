import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

// Workaround for Next.js server environment: prevent PDFKit from loading font files
const originalReadFileSync = fs.readFileSync;

(fs.readFileSync as any) = function(filePath: any, options?: any) {
  if (typeof filePath === 'string' && filePath.includes('.afm')) {
    console.log('🚫 Blocked font file access:', filePath);
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

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 30,
        bufferPages: false,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      try {
        const pageWidth = 595;
        const pageHeight = 842;
        const margin = 30;
        const contentWidth = pageWidth - (margin * 2);
        let y = margin;

        // Draw border around entire page
        doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2)).stroke('#000000');

        // Header Section
        y = margin + 15;

        // Logo on left
        try {
          const logoPath = path.join(process.cwd(), 'public', 'images', 'anamico-logo.jpeg');
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, margin + 15, y, { width: 80, height: 80 });
          }
        } catch (logoError) {
          console.log('Logo not found, skipping');
        }

        // Company details in center
        doc.fontSize(14).font('Helvetica-Bold').text('ANAMICO INDIA PRIVATE LIMITED', margin + 110, y, { width: 240, align: 'center' });
        y += 18;
        doc.fontSize(8).font('Helvetica').text('WZ-663, Office No-204, Near Punjabi Bagh Apartment,', margin + 110, y, { width: 240, align: 'center' });
        y += 10;
        doc.text('Madipur', margin + 110, y, { width: 240, align: 'center' });
        y += 10;
        doc.text('Delhi 110063', margin + 110, y, { width: 240, align: 'center' });
        y += 10;
        doc.text('India', margin + 110, y, { width: 240, align: 'center' });
        y += 10;
        doc.text('GSTIN 07AAXCA2423P1Z3', margin + 110, y, { width: 240, align: 'center' });

        // TAX INVOICE on right
        y = margin + 30;
        doc.fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', pageWidth - margin - 130, y, { width: 130, align: 'left' });

        // Horizontal line after header
        y = margin + 100;
        doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke('#000000');

        // Invoice Details Table
        y += 1;
        const detailsHeight = 65;
        const midX = margin + (contentWidth / 2);

        // Left column
        let rowY = y;
        doc.fontSize(8).font('Helvetica-Bold').text('#', margin + 5, rowY + 5);
        doc.font('Helvetica').text(`: ${data.invoiceNumber || `INV-${data.orderNumber}`}`, margin + 80, rowY + 5);

        rowY += 16;
        doc.moveTo(margin, rowY).lineTo(pageWidth - margin, rowY).stroke('#000000');
        doc.font('Helvetica-Bold').text('Invoice Date', margin + 5, rowY + 5);
        doc.font('Helvetica').text(`: ${(data.invoiceDate || data.orderDate).toLocaleDateString('en-IN')}`, margin + 80, rowY + 5);

        rowY += 16;
        doc.moveTo(margin, rowY).lineTo(pageWidth - margin, rowY).stroke('#000000');
        doc.font('Helvetica-Bold').text('Terms', margin + 5, rowY + 5);
        doc.font('Helvetica').text(': Due on Receipt', margin + 80, rowY + 5);

        rowY += 16;
        doc.moveTo(margin, rowY).lineTo(pageWidth - margin, rowY).stroke('#000000');
        doc.font('Helvetica-Bold').text('Due Date', margin + 5, rowY + 5);
        doc.font('Helvetica').text(`: ${(data.dueDate || data.orderDate).toLocaleDateString('en-IN')}`, margin + 80, rowY + 5);

        // Right column
        rowY = y;
        doc.moveTo(midX, y).lineTo(midX, y + detailsHeight).stroke('#000000');

        doc.font('Helvetica-Bold').text('Place Of Supply', midX + 5, rowY + 5);
        doc.font('Helvetica').text(`: ${data.placeOfSupply || data.shippingState}`, midX + 80, rowY + 5);

        y += detailsHeight;
        doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke('#000000');

        // Bill To / Ship To Section
        y += 1;
        const billToHeight = 85;

        doc.fontSize(9).font('Helvetica-Bold').text('Bill To', margin + 5, y + 5);
        doc.text('Ship To', midX + 5, y + 5);

        y += 15;
        doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke('#000000');
        doc.moveTo(midX, y - 15).lineTo(midX, y + billToHeight - 15).stroke('#000000');

        // Bill To content
        doc.fontSize(9).font('Helvetica-Bold').text(data.customerName, margin + 5, y + 5, { width: (contentWidth / 2) - 10 });
        y += 12;
        doc.fontSize(8).font('Helvetica').text(data.shippingAddress, margin + 5, y, { width: (contentWidth / 2) - 10 });
        y += 10;
        doc.text(`${data.shippingCity}`, margin + 5, y);
        y += 10;
        doc.text(`${data.shippingPincode} ${data.shippingState}`, margin + 5, y);
        y += 10;
        doc.text('India', margin + 5, y);
        if (data.customerGSTIN) {
          y += 10;
          doc.text(`GSTIN ${data.customerGSTIN}`, margin + 5, y);
        }

        // Ship To content (same as Bill To)
        y -= (data.customerGSTIN ? 50 : 40);
        doc.fontSize(8).font('Helvetica').text(data.shippingAddress, midX + 5, y, { width: (contentWidth / 2) - 10 });
        y += 10;
        doc.text(`${data.shippingCity}`, midX + 5, y);
        y += 10;
        doc.text(`${data.shippingPincode} ${data.shippingState}`, midX + 5, y);
        y += 10;
        doc.text('India', midX + 5, y);
        if (data.customerGSTIN) {
          y += 10;
          doc.text(`GSTIN ${data.customerGSTIN}`, midX + 5, y);
        }

        y = y + (data.customerGSTIN ? 25 : 35);
        doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke('#000000');

        // Items Table
        y += 1;
        const itemsTableY = y;

        // Table header
        doc.rect(margin, y, contentWidth, 18).fillAndStroke('#e6e6e6', '#000000');

        doc.fontSize(7).fillColor('#000000').font('Helvetica-Bold');
        doc.text('#', margin + 3, y + 6);
        doc.text('Item & Description', margin + 20, y + 6);
        doc.text('HSN/SAC', margin + 210, y + 6);
        doc.text('Qty', margin + 265, y + 6);
        doc.text('Rate', margin + 310, y + 6);
        doc.text('IGST', margin + 365, y + 2);
        doc.fontSize(6).text('%', margin + 370, y + 10);
        doc.fontSize(7).text('Amt', margin + 385, y + 10);
        doc.text('Amount', margin + 470, y + 6);

        y += 18;

        // Table items
        doc.fontSize(8).font('Helvetica');
        data.items.forEach((item, index) => {
          const rowHeight = 35;

          doc.rect(margin, y, contentWidth, rowHeight).stroke('#000000');

          // Vertical lines
          doc.moveTo(margin + 17, y).lineTo(margin + 17, y + rowHeight).stroke('#000000');
          doc.moveTo(margin + 207, y).lineTo(margin + 207, y + rowHeight).stroke('#000000');
          doc.moveTo(margin + 262, y).lineTo(margin + 262, y + rowHeight).stroke('#000000');
          doc.moveTo(margin + 307, y).lineTo(margin + 307, y + rowHeight).stroke('#000000');
          doc.moveTo(margin + 360, y).lineTo(margin + 360, y + rowHeight).stroke('#000000');
          doc.moveTo(margin + 423, y).lineTo(margin + 423, y + rowHeight).stroke('#000000');

          doc.text((index + 1).toString(), margin + 5, y + 5);
          doc.font('Helvetica-Bold').text(item.productName, margin + 20, y + 5, { width: 180 });
          doc.fontSize(7).font('Helvetica').text(item.productName, margin + 20, y + 14, { width: 180 });
          doc.fontSize(8).text(item.hsnCode || '85444292', margin + 212, y + 12);
          doc.text(item.quantity.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), margin + 267, y + 12);
          doc.text(item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), margin + 312, y + 12);
          doc.text(`${item.igstPercent || 18}%`, margin + 368, y + 12);

          // Calculate IGST amount from the item total (which already includes tax)
          const igstAmount = item.igstAmount || (item.total - (item.total / 1.18));
          doc.text(igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), margin + 363, y + 22);
          doc.text(item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), margin + 428, y + 12, { width: 137, align: 'right' });

          y += rowHeight;
        });

        // Summary section
        const summaryStartY = y;
        const summaryLeft = margin;
        const summaryRight = margin + (contentWidth * 0.6);

        // Total in words section (left side)
        doc.fontSize(8).font('Helvetica-Bold').text('Total In Words', summaryLeft + 5, summaryStartY + 5);
        y += 12;
        doc.fontSize(8).font('Helvetica-BoldOblique').text('Indian Rupee One Lakh Three Hundred Only', summaryLeft + 5, summaryStartY + 17, { width: (contentWidth * 0.6) - 10 });

        y += 25;
        doc.fontSize(8).font('Helvetica-Bold').text('Notes', summaryLeft + 5, summaryStartY + 42);

        y += 30;
        doc.fontSize(8).font('Helvetica-Bold').text('Bank Account Detail', summaryLeft + 5, summaryStartY + 72);
        y += 12;
        doc.fontSize(7).font('Helvetica')
          .text('Name - ANAMICO INDIA PRIVATE LIMITED', summaryLeft + 5, summaryStartY + 84)
          .text('Bank - HDFC BANK', summaryLeft + 5, summaryStartY + 94)
          .text('A/c - 50200080572373', summaryLeft + 5, summaryStartY + 104)
          .text('IFSC CODE - HDFC0000091', summaryLeft + 5, summaryStartY + 114)
          .text('BRANCH - PUNJABI BAGH, DELHI', summaryLeft + 5, summaryStartY + 124);

        // Summary box (right side)
        doc.moveTo(summaryRight, summaryStartY).lineTo(summaryRight, summaryStartY + 80).stroke('#000000');

        doc.fontSize(9).font('Helvetica-Bold');
        let summaryY = summaryStartY + 5;
        const summaryValueWidth = (pageWidth - margin) - (summaryRight + 10);

        doc.text('Sub Total', summaryRight + 5, summaryY, { width: 100 });
        doc.font('Helvetica').text(data.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), summaryRight + 110, summaryY, { width: summaryValueWidth - 110, align: 'right' });

        summaryY += 16;
        doc.moveTo(summaryRight, summaryY).lineTo(pageWidth - margin, summaryY).stroke('#000000');

        summaryY += 5;
        doc.font('Helvetica-Bold').text('IGST18 (18%)', summaryRight + 5, summaryY, { width: 100 });
        doc.font('Helvetica').text(data.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), summaryRight + 110, summaryY, { width: summaryValueWidth - 110, align: 'right' });

        summaryY += 16;
        doc.moveTo(summaryRight, summaryY).lineTo(pageWidth - margin, summaryY).stroke('#000000');

        summaryY += 5;
        doc.font('Helvetica-Bold').text('Total', summaryRight + 5, summaryY, { width: 100 });
        doc.text(`\u20B9${data.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryRight + 110, summaryY, { width: summaryValueWidth - 110, align: 'right' });

        summaryY += 16;
        doc.moveTo(summaryRight, summaryY).lineTo(pageWidth - margin, summaryY).stroke('#000000');

        summaryY += 5;
        doc.font('Helvetica-Bold').text('Balance Due', summaryRight + 5, summaryY, { width: 100 });
        doc.text(`\u20B9${data.dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryRight + 110, summaryY, { width: summaryValueWidth - 110, align: 'right' });

        // Terms & Conditions
        y = summaryStartY + 145;
        doc.fontSize(8).font('Helvetica-Bold').text('Terms & Conditions', summaryLeft + 5, y);
        y += 10;
        doc.fontSize(8).text('Terms & Conditions', summaryLeft + 5, y);
        y += 10;

        doc.fontSize(6).font('Helvetica');
        const terms = [
          '1) Goods once sold will bot be taken back or exchanged',
          '2) Seller is not responsible for any loss or damaged of goods in transit',
          '3) Disputes if any will be subject to Delhi Jurisdiction only',
          '4) Warranty by Principal of Company',
          '5) Interest @ 24% p.a. will be Charged if any payment is not made within the',
          '   stipulated time',
          '6) Cheque bounce charges will be Rs. 500/- per cheque'
        ];

        terms.forEach((term) => {
          doc.text(term, summaryLeft + 5, y);
          y += 8;
        });

        // Authorized Signature (right side)
        doc.fontSize(8).font('Helvetica-Bold').text('Authorized Signature', summaryRight + 5, summaryStartY + 145);

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

export function getInvoiceFilename(orderNumber: string): string {
  return `Invoice-${orderNumber}.pdf`;
}
