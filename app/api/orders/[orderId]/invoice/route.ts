import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';
import { order, orderItem, user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { generateInvoicePDF, getInvoiceFilename, InvoiceData } from '@/lib/invoice-generator';

/**
 * GET /api/orders/[orderId]/invoice
 * Generate and download invoice PDF for an order
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;

    // Fetch order
    const [existingOrder] = await db
      .select()
      .from(order)
      .where(eq(order.id, orderId));

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order belongs to current user
    if (existingOrder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch order items
    const items = await db
      .select()
      .from(orderItem)
      .where(eq(orderItem.orderId, orderId));

    console.log('📥 Generating invoice for order:', orderId);

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      orderNumber: existingOrder.orderNumber,
      orderDate: typeof existingOrder.createdAt === 'string' ? new Date(existingOrder.createdAt) : existingOrder.createdAt,
      customerName: existingOrder.shippingName,
      customerEmail: existingOrder.shippingEmail,
      customerPhone: existingOrder.shippingPhone,
      shippingAddress: existingOrder.shippingAddress,
      shippingCity: existingOrder.shippingCity,
      shippingState: existingOrder.shippingState,
      shippingPincode: existingOrder.shippingPincode,
      items: items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      subtotal: existingOrder.subtotal,
      tax: existingOrder.tax,
      total: existingOrder.total,
      paidAmount: existingOrder.paidAmount || 0,
      dueAmount: existingOrder.total - (existingOrder.paidAmount || 0),
      paymentStatus: existingOrder.paymentStatus,
      status: existingOrder.status,
      invoiceNumber: `INV-${existingOrder.orderNumber}`,
      shippedAt: existingOrder.shippedAt ?
        typeof existingOrder.shippedAt === 'string' ? new Date(existingOrder.shippedAt) : existingOrder.shippedAt
        : undefined,
      deliveredAt: existingOrder.deliveredAt ?
        typeof existingOrder.deliveredAt === 'string' ? new Date(existingOrder.deliveredAt) : existingOrder.deliveredAt
        : undefined,
    };

    console.log('📄 Invoice data prepared, generating PDF...');

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    console.log(`✅ Invoice PDF generated: ${pdfBuffer.length} bytes`);

    // Get filename
    const filename = getInvoiceFilename(existingOrder.orderNumber);

    // Return PDF as download
    const response = new NextResponse(pdfBuffer);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    response.headers.set('Content-Length', pdfBuffer.length.toString());

    return response;
  } catch (error) {
    console.error('Error generating invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate invoice: ${errorMessage}` },
      { status: 500 }
    );
  }
}
