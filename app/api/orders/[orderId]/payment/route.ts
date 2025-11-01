import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { order } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

/**
 * POST /api/orders/[orderId]/payment
 * Record partial payment for an order
 * After payment is recorded, order status changes to 'payment_received'
 * Order then awaits admin approval
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;
    const body = await req.json();
    const { paidAmount, paymentId, paymentMethod } = body;

    if (!paidAmount || !paymentId) {
      return NextResponse.json(
        { error: 'Missing paidAmount or paymentId' },
        { status: 400 }
      );
    }

    // Fetch the order
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

    // Calculate percentage paid
    const percentagePaid = Math.round((paidAmount / existingOrder.total) * 100);

    console.log('Recording payment:', {
      orderId,
      paidAmount,
      totalAmount: existingOrder.total,
      percentagePaid,
      paymentId,
    });

    // Update order status to 'payment_received' after partial payment
    // Order is now awaiting admin approval
    await db
      .update(order)
      .set({
        status: 'payment_received', // Payment received, awaiting admin approval
        paymentStatus: 'partial_payment', // Marked as partial payment
        paymentId,
        paymentMethod: paymentMethod || 'razorpay',
        paidAmount,
        updatedAt: new Date(),
      })
      .where(eq(order.id, orderId));

    console.log('Payment recorded and order awaiting admin approval:', orderId);

    return NextResponse.json({
      success: true,
      message: 'Payment recorded. Order is now awaiting admin approval.',
      orderStatus: 'payment_received',
      orderData: {
        id: orderId,
        status: 'payment_received',
        paymentStatus: 'partial_payment',
        paidAmount,
        percentagePaid,
        pendingApproval: true,
      },
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to record payment: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/[orderId]/payment
 * Get payment status for an order
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

    const [existingOrder] = await db
      .select()
      .from(order)
      .where(eq(order.id, orderId));

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (existingOrder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const percentagePaid = existingOrder.paidAmount
      ? Math.round((existingOrder.paidAmount / existingOrder.total) * 100)
      : 0;

    return NextResponse.json({
      orderId,
      paymentStatus: existingOrder.paymentStatus,
      paidAmount: existingOrder.paidAmount,
      totalAmount: existingOrder.total,
      remainingAmount: existingOrder.total - existingOrder.paidAmount,
      percentagePaid,
      orderStatus: existingOrder.status,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
