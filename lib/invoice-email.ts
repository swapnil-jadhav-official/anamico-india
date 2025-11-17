import { sendEmail } from './email';
import { generateInvoicePDF, getInvoiceFilename, InvoiceData, InvoiceItem } from './invoice-generator';

interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date | string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  paymentStatus: string;
  status: string;
  shippedAt?: Date | string;
  deliveredAt?: Date | string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Generate invoice email HTML
 */
function getInvoiceEmailHTML(data: InvoiceData): string {
  const statusText = data.status === 'delivered' ? 'delivered' :
                     data.status === 'shipped' ? 'shipped' :
                     data.status === 'accepted' ? 'confirmed' : 'received';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${data.orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">ANAMICO INDIA</h1>
            <p style="margin: 5px 0 0 0;">UIDAI Certified Partner</p>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; margin-top: 20px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">
              ${data.dueAmount === 0 ? 'Invoice' : 'Proforma Invoice'}
            </h2>
            <p>Dear ${data.customerName},</p>
            <p>
              ${data.status === 'delivered'
                ? `Thank you for your purchase! Your order has been ${statusText}. Please find attached your invoice.`
                : data.status === 'shipped'
                ? `Your order has been ${statusText}! Please find attached your invoice. You will receive delivery confirmation once the order is delivered.`
                : `Thank you for placing your order! Please find attached your ${data.dueAmount > 0 ? 'proforma invoice' : 'invoice'}.`
              }
            </p>
          </div>

          <div style="margin-top: 20px; padding: 20px; border: 1px solid #e5e7eb;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Order Number:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Order Date:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  ${data.orderDate.toLocaleDateString('en-IN')}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Order Status:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  <span style="background-color: ${data.status === 'delivered' ? '#16a34a' : data.status === 'shipped' ? '#2563eb' : '#eab308'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${statusText.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 18px; color: #1e3a8a;">
                  ₹${data.total.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Paid Amount:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #16a34a;">
                  ₹${data.paidAmount.toLocaleString('en-IN')}
                </td>
              </tr>
              ${data.dueAmount > 0 ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Due Amount:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: #dc2626;">
                    ₹${data.dueAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ` : ''}
            </table>
          </div>

          ${data.deliveredAt ? `
            <div style="margin-top: 20px; padding: 15px; background-color: #d1fae5; border-left: 4px solid #16a34a;">
              <p style="margin: 0; color: #065f46;">
                <strong>✓ Delivered:</strong> Your order was delivered on ${new Date(data.deliveredAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          ` : data.shippedAt ? `
            <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #1e40af;">
                <strong>→ Shipped:</strong> Your order was shipped on ${new Date(data.shippedAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; text-align: center;">
            <p style="margin: 0 0 10px 0;">If you have any questions about your order, please contact us:</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> info@anamicoindia.com</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> +91 9818424815</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb;">
            <p>© ${new Date().getFullYear()} ANAMICO India Private Limited. All rights reserved.</p>
            <p style="margin: 5px 0;">This is an automated email. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send invoice email to customer
 */
export async function sendInvoiceEmail(order: Order): Promise<void> {
  try {
    // Prepare invoice data
    const invoiceData: InvoiceData = {
      orderNumber: order.orderNumber,
      orderDate: typeof order.createdAt === 'string' ? new Date(order.createdAt) : order.createdAt,
      customerName: order.shippingName,
      customerEmail: order.shippingEmail,
      customerPhone: order.shippingPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPincode: order.shippingPincode,
      items: order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      paidAmount: order.paidAmount || 0,
      dueAmount: order.total - (order.paidAmount || 0),
      paymentStatus: order.paymentStatus,
      status: order.status,
      invoiceNumber: `INV-${order.orderNumber}`,
      shippedAt: order.shippedAt ? (typeof order.shippedAt === 'string' ? new Date(order.shippedAt) : order.shippedAt) : undefined,
      deliveredAt: order.deliveredAt ? (typeof order.deliveredAt === 'string' ? new Date(order.deliveredAt) : order.deliveredAt) : undefined,
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    const filename = getInvoiceFilename(order.orderNumber);

    // Prepare email
    const emailHTML = getInvoiceEmailHTML(invoiceData);

    const subject = invoiceData.status === 'delivered'
      ? `Order Delivered - Invoice ${order.orderNumber}`
      : invoiceData.status === 'shipped'
      ? `Order Shipped - Invoice ${order.orderNumber}`
      : invoiceData.dueAmount > 0
      ? `Proforma Invoice - Order ${order.orderNumber}`
      : `Invoice - Order ${order.orderNumber}`;

    // Send email with PDF attachment
    await sendEmail({
      to: order.shippingEmail,
      subject,
      html: emailHTML,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    console.log(`✅ Invoice email sent successfully for order ${order.orderNumber}`);
  } catch (error) {
    console.error(`❌ Error sending invoice email for order ${order.orderNumber}:`, error);
    throw error;
  }
}
