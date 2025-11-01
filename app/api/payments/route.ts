import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';
import { order } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  createMockOrder,
  createMockPayment,
  verifyPaymentSignature,
  generateMockCheckoutOptions,
} from '@/lib/razorpay-mock';

/**
 * POST /api/payments
 * Create a Razorpay order and return checkout options
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // Check if this is a verify request
    if (url.pathname.includes('/verify')) {
      return handleVerifyPayment(req);
    }

    // Otherwise, create new payment order
    return await handleCreatePayment(req);
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

async function handleCreatePayment(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, paymentType } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order from database
    const orders = await db
      .select()
      .from(order)
      .where(eq(order.id, orderId))
      .limit(1);

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const currentOrder = orders[0];

    // Calculate payment amount based on payment type
    let paymentAmount = 0;
    if (paymentType === '30') {
      paymentAmount = Math.round((currentOrder.total * 0.3) / 100) * 100;
    } else if (paymentType === '50') {
      paymentAmount = Math.round((currentOrder.total * 0.5) / 100) * 100;
    } else if (paymentType === '100') {
      paymentAmount = currentOrder.total;
    } else {
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      );
    }

    // Create mock Razorpay order
    const razorpayOrder = createMockOrder(
      paymentAmount / 100, // Convert back to rupees
      currentOrder.orderNumber
    );

    // Generate checkout options
    const checkoutOptions = generateMockCheckoutOptions(
      razorpayOrder.id,
      paymentAmount / 100,
      session.user.email,
      session.user.name || 'Customer'
    );

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      checkoutOptions,
      paymentAmount: paymentAmount / 100,
      paymentType,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

async function handleVerifyPayment(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      orderId: dbOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentType,
    } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify signature
    const isSignatureValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Create mock payment
    const payment = createMockPayment(razorpayOrderId, 0);

    // Calculate payment amount
    let paymentAmount = 0;
    const orders = await db
      .select()
      .from(order)
      .where(eq(order.id, dbOrderId))
      .limit(1);

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const existingOrder = orders[0];

    if (paymentType === '30') {
      paymentAmount = Math.round(existingOrder.total * 0.3);
    } else if (paymentType === '50') {
      paymentAmount = Math.round(existingOrder.total * 0.5);
    } else if (paymentType === '100') {
      paymentAmount = existingOrder.total;
    }

    // Update order with payment info
    await db
      .update(order)
      .set({
        paidAmount: (existingOrder.paidAmount || 0) + paymentAmount,
        paymentStatus:
          (existingOrder.paidAmount || 0) + paymentAmount >= existingOrder.total
            ? 'completed'
            : 'partial_payment',
        status: 'payment_received',
      })
      .where(eq(order.id, dbOrderId));

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment.id,
        amount: paymentAmount,
        status: 'captured',
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
