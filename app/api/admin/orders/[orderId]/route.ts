import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { order, orderItem, user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import {
  generateOrderApprovedEmail,
  generateOrderRejectedEmail,
  generateOrderShippedEmail,
  generateOrderDeliveredEmail
} from '@/lib/email-templates';

/**
 * GET /api/admin/orders/[orderId]
 * Get order details for admin review
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
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

    // Fetch order items
    const items = await db
      .select()
      .from(orderItem)
      .where(eq(orderItem.orderId, orderId));

    // Return order with items
    return NextResponse.json({
      ...existingOrder,
      items,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/[orderId]
 * Admin can approve, reject, ship, or deliver orders
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { orderId } = params;
    const body = await req.json();
    const { action, adminNotes, rejectionReason, trackingNumber, shippingCarrier, trackingUrl } = body;

    if (!action || !['approve', 'reject', 'ship', 'deliver'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve", "reject", "ship", or "deliver"' },
        { status: 400 }
      );
    }

    const [existingOrder] = await db
      .select()
      .from(order)
      .where(eq(order.id, orderId));

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Validate status transitions
    if (action === 'approve' && existingOrder.status !== 'payment_received') {
      return NextResponse.json(
        { error: 'Order cannot be approved. It must be in "payment_received" status.' },
        { status: 400 }
      );
    }

    if (action === 'reject' && existingOrder.status !== 'payment_received') {
      return NextResponse.json(
        { error: 'Order cannot be rejected. It must be in "payment_received" status.' },
        { status: 400 }
      );
    }

    if (action === 'ship' && existingOrder.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Order cannot be shipped. It must be in "accepted" status.' },
        { status: 400 }
      );
    }

    if (action === 'deliver' && existingOrder.status !== 'shipped') {
      return NextResponse.json(
        { error: 'Order cannot be delivered. It must be in "shipped" status.' },
        { status: 400 }
      );
    }

    let updateData: any = {
      adminNotes: adminNotes || existingOrder.adminNotes,
      updatedAt: new Date(),
    };

    let successMessage = '';

    if (action === 'approve') {
      // Order accepted by admin - ready for processing/shipping
      updateData.status = 'accepted';
      successMessage = 'Order accepted! Ready for processing.';

      console.log('Order approved by admin:', {
        orderId,
        adminNotes,
        approvedAt: new Date(),
      });
    } else if (action === 'reject') {
      // Order rejected by admin - customer needs to be refunded
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'rejectionReason is required for rejection' },
          { status: 400 }
        );
      }
      updateData.status = 'rejected';
      updateData.rejectionReason = rejectionReason;
      successMessage = 'Order rejected. Customer will be notified for refund.';

      console.log('Order rejected by admin:', {
        orderId,
        rejectionReason,
        rejectedAt: new Date(),
      });
    } else if (action === 'ship') {
      // Order shipped - provide tracking information
      if (!trackingNumber || !shippingCarrier) {
        return NextResponse.json(
          { error: 'trackingNumber and shippingCarrier are required for shipping' },
          { status: 400 }
        );
      }
      updateData.status = 'shipped';
      updateData.trackingNumber = trackingNumber;
      updateData.shippingCarrier = shippingCarrier;
      updateData.trackingUrl = trackingUrl || null; // Optional tracking URL
      updateData.shippedAt = new Date();
      successMessage = 'Order marked as shipped!';

      console.log('Order shipped:', {
        orderId,
        trackingNumber,
        shippingCarrier,
        trackingUrl,
        shippedAt: new Date(),
      });
    } else if (action === 'deliver') {
      // Order delivered - mark as completed
      updateData.status = 'delivered';
      updateData.deliveredAt = new Date();
      successMessage = 'Order marked as delivered!';

      console.log('Order delivered:', {
        orderId,
        deliveredAt: new Date(),
      });
    }

    await db
      .update(order)
      .set(updateData)
      .where(eq(order.id, orderId));

    // Get customer details for email
    const [customerData] = await db
      .select()
      .from(user)
      .where(eq(user.id, existingOrder.userId));

    const customerEmail = existingOrder.shippingEmail || customerData?.email || '';
    const customerName = existingOrder.shippingName || customerData?.name || 'Customer';

    // Send appropriate email based on action
    try {
      if (action === 'approve') {
        const emailContent = generateOrderApprovedEmail(
          customerName,
          existingOrder.orderNumber
        );

        await sendEmail({
          to: customerEmail,
          subject: `Order Approved - ${existingOrder.orderNumber}`,
          html: emailContent.html,
          text: emailContent.text,
        });

        console.log(`✅ Order approved email sent to ${customerEmail}`);
      } else if (action === 'reject') {
        const emailContent = generateOrderRejectedEmail(
          customerName,
          existingOrder.orderNumber,
          rejectionReason
        );

        await sendEmail({
          to: customerEmail,
          subject: `Order Update - ${existingOrder.orderNumber}`,
          html: emailContent.html,
          text: emailContent.text,
        });

        console.log(`✅ Order rejected email sent to ${customerEmail}`);
      } else if (action === 'ship') {
        const emailContent = generateOrderShippedEmail(
          customerName,
          existingOrder.orderNumber,
          trackingNumber,
          shippingCarrier,
          trackingUrl
        );

        await sendEmail({
          to: customerEmail,
          subject: `Order Shipped - ${existingOrder.orderNumber}`,
          html: emailContent.html,
          text: emailContent.text,
        });

        console.log(`✅ Order shipped email sent to ${customerEmail}`);
      } else if (action === 'deliver') {
        const emailContent = generateOrderDeliveredEmail(
          customerName,
          existingOrder.orderNumber
        );

        await sendEmail({
          to: customerEmail,
          subject: `Order Delivered - ${existingOrder.orderNumber}`,
          html: emailContent.html,
          text: emailContent.text,
        });

        console.log(`✅ Order delivered email sent to ${customerEmail}`);
      }
    } catch (emailError) {
      console.error(`❌ Failed to send ${action} email:`, emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
      orderId,
      status: updateData.status,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update order: ${errorMessage}` },
      { status: 500 }
    );
  }
}
