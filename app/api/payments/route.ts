import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';
import { order } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  createMockOrder,
  createMockPayment,
  verifyPaymentSignature as verifyMockPaymentSignature,
  generateMockCheckoutOptions,
} from '@/lib/razorpay-mock';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  generateCheckoutOptions,
  fetchRazorpayPayment,
} from '@/lib/razorpay';

/**
 * POST /api/payments
 * Create a Razorpay order and return checkout options
 * POST /api/payments/verify
 * Verify payment and update order status
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is a verify request
    if (body.razorpayOrderId && body.razorpayPaymentId) {
      return handleVerifyPayment(req, body);
    }

    // Otherwise, create new payment order
    return await handleCreatePayment(req, body);
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

async function handleCreatePayment(_req: NextRequest, body: any) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, paymentType } = body;

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
    const paymentTypeStr = String(paymentType);

    if (paymentTypeStr === '30') {
      paymentAmount = Math.round(currentOrder.total * 0.3);
    } else if (paymentTypeStr === '50') {
      paymentAmount = Math.round(currentOrder.total * 0.5);
    } else if (paymentTypeStr === '100') {
      paymentAmount = currentOrder.total;
    } else {
      return NextResponse.json(
        { error: `Invalid payment type: ${paymentType}` },
        { status: 400 }
      );
    }

    // Create Razorpay order (real or mock based on credentials)
    let razorpayOrder;
    let checkoutOptions;

    const isRealRazorpay = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
                           !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('mock');

    if (isRealRazorpay) {
      // Use real Razorpay API
      try {
        razorpayOrder = await createRazorpayOrder(
          paymentAmount,
          currentOrder.orderNumber,
          {
            orderId: orderId,
            userId: currentOrder.userId,
          }
        );

        checkoutOptions = generateCheckoutOptions(
          razorpayOrder.id,
          paymentAmount,
          session.user.email,
          session.user.name || 'Customer'
        );
      } catch (error) {
        console.error('Razorpay API error:', error);
        return NextResponse.json(
          { error: 'Failed to initialize payment. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      // Use mock Razorpay for development
      razorpayOrder = createMockOrder(
        paymentAmount,
        currentOrder.orderNumber
      );

      checkoutOptions = generateMockCheckoutOptions(
        razorpayOrder.id,
        paymentAmount,
        session.user.email,
        session.user.name || 'Customer'
      );
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      checkoutOptions,
      paymentAmount,
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

async function handleVerifyPayment(_req: NextRequest, body: any) {
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
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Check if using real Razorpay
    const isRealRazorpay = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
                           !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('mock');

    // Verify signature (real or mock based on credentials)
    let isSignatureValid = false;

    if (isRealRazorpay) {
      // Verify with real Razorpay signature
      try {
        isSignatureValid = verifyRazorpaySignature(
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );
      } catch (error) {
        console.error('Signature verification error:', error);
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }
    } else {
      // Use mock verification
      isSignatureValid = verifyMockPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );
    }

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Fetch order to calculate payment amount
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

    // Calculate payment amount based on payment type
    let paymentAmount = 0;
    const paymentTypeStr = String(paymentType);

    if (paymentTypeStr === '30') {
      paymentAmount = Math.round(existingOrder.total * 0.3);
    } else if (paymentTypeStr === '50') {
      paymentAmount = Math.round(existingOrder.total * 0.5);
    } else if (paymentTypeStr === '100') {
      paymentAmount = existingOrder.total;
    } else {
      return NextResponse.json(
        { error: `Invalid payment type: ${paymentType}` },
        { status: 400 }
      );
    }

    // Create or fetch payment (real or mock based on credentials)
    let payment;

    if (isRealRazorpay) {
      // Fetch real payment from Razorpay
      try {
        payment = await fetchRazorpayPayment(razorpayPaymentId);
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
        return NextResponse.json(
          { error: 'Failed to verify payment details' },
          { status: 500 }
        );
      }
    } else {
      // Create mock payment
      payment = createMockPayment(razorpayOrderId, paymentAmount);
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
        paymentMethod: isRealRazorpay ? 'razorpay' : 'mock_razorpay',
        paymentId: payment.id,
      })
      .where(eq(order.id, dbOrderId));

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment.id,
        amount: paymentAmount,
        status: isRealRazorpay ? payment.status : 'captured',
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
