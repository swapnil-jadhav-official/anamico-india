import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { order, orderItem, user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { sendEmail, sendAdminEmail } from '@/lib/email';
import {
  generatePaymentReceivedEmail,
  generateAdminPaymentReceivedEmail,
  generateOrderConfirmationEmail,
  generateAdminNewOrderEmail
} from '@/lib/email-templates';

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

    // Determine payment status based on amount paid
    const newPaymentStatus = paidAmount >= existingOrder.total ? 'completed' : 'partial_payment';

    // Update order status to 'payment_received' after partial payment
    // Order is now awaiting admin approval
    await db
      .update(order)
      .set({
        status: 'payment_received', // Payment received, awaiting admin approval
        paymentStatus: newPaymentStatus,
        paymentId,
        paymentMethod: paymentMethod || 'razorpay',
        paidAmount,
        updatedAt: new Date(),
      })
      .where(eq(order.id, orderId));

    console.log('Payment recorded and order awaiting admin approval:', orderId);

    // Get customer details for email
    const [customerData] = await db
      .select()
      .from(user)
      .where(eq(user.id, existingOrder.userId));

    // Fetch order items for confirmation email
    const items = await db
      .select()
      .from(orderItem)
      .where(eq(orderItem.orderId, orderId));

    const customerEmail = existingOrder.shippingEmail || customerData?.email || '';
    const customerName = existingOrder.shippingName || customerData?.name || 'Customer';

    // Send order confirmation email to customer (sent after payment, not at order creation)
    try {
      const orderItemsForEmail = items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      }));

      const emailContent = generateOrderConfirmationEmail(
        customerName,
        existingOrder.orderNumber,
        orderItemsForEmail,
        existingOrder.subtotal,
        existingOrder.tax,
        existingOrder.total,
        {
          name: existingOrder.shippingName,
          address: existingOrder.shippingAddress,
          city: existingOrder.shippingCity,
          state: existingOrder.shippingState,
          pincode: existingOrder.shippingPincode,
          phone: existingOrder.shippingPhone,
        }
      );

      await sendEmail({
        to: customerEmail,
        subject: `Order Confirmation - ${existingOrder.orderNumber}`,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`✅ Order confirmation email sent to ${customerEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send order confirmation email:', emailError);
    }

    // Send payment confirmation email to customer
    try {
      const emailContent = generatePaymentReceivedEmail(
        customerName,
        existingOrder.orderNumber,
        paidAmount,
        existingOrder.total,
        newPaymentStatus
      );

      await sendEmail({
        to: customerEmail,
        subject: `Payment Received - ${existingOrder.orderNumber}`,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`✅ Payment confirmation email sent to ${customerEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send payment confirmation email:', emailError);
    }

    // Send new order notification to admin
    try {
      const adminEmailContent = generateAdminNewOrderEmail(
        existingOrder.orderNumber,
        customerName,
        customerEmail,
        existingOrder.total,
        items.length,
        'payment_received'
      );

      await sendAdminEmail(
        `New Order - ${existingOrder.orderNumber}`,
        adminEmailContent.html,
        adminEmailContent.text
      );

      console.log(`✅ Admin order notification sent for order ${existingOrder.orderNumber}`);
    } catch (emailError) {
      console.error('❌ Failed to send admin order notification:', emailError);
    }

    // Send payment notification to admin
    try {
      const adminEmailContent = generateAdminPaymentReceivedEmail(
        existingOrder.orderNumber,
        customerName,
        paidAmount,
        existingOrder.total,
        newPaymentStatus
      );

      await sendAdminEmail(
        `Payment Received - ${existingOrder.orderNumber}`,
        adminEmailContent.html,
        adminEmailContent.text
      );

      console.log(`✅ Admin payment notification sent for order ${existingOrder.orderNumber}`);
    } catch (emailError) {
      console.error('❌ Failed to send admin payment notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment recorded. Order is now awaiting admin approval.',
      orderStatus: 'payment_received',
      orderData: {
        id: orderId,
        status: 'payment_received',
        paymentStatus: newPaymentStatus,
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
