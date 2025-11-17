import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { order, orderItem } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { generateInvoicePDF, getInvoiceFilename, InvoiceData } from '@/lib/invoice-generator';

/**
 * GET /api/orders/[orderId]/invoice
 * Download invoice PDF for an order
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

    // Fetch the order
    const [existingOrder] = await db
      .select()
      .from(order)
      .where(eq(order.id, orderId));

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order belongs to current user (or user is admin)
    if (existingOrder.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch order items
    const items = await db
      .select()
      .from(orderItem)
      .where(eq(orderItem.orderId, orderId));

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
      paymentStatus: existingOrder.paymentStatus || 'pending',
      status: existingOrder.status,
      invoiceNumber: `INV-${existingOrder.orderNumber}`,
      shippedAt: existingOrder.shippedAt ? (typeof existingOrder.shippedAt === 'string' ? new Date(existingOrder.shippedAt) : existingOrder.shippedAt) : undefined,
      deliveredAt: existingOrder.deliveredAt ? (typeof existingOrder.deliveredAt === 'string' ? new Date(existingOrder.deliveredAt) : existingOrder.deliveredAt) : undefined,
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    const filename = getInvoiceFilename(existingOrder.orderNumber);

    console.log(`✅ Invoice PDF generated for order ${existingOrder.orderNumber}`);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate invoice: ${errorMessage}` },
      { status: 500 }
    );
  }
}
