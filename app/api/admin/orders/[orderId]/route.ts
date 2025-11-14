import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { order, orderItem } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

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
 * Admin can approve or reject orders
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
    const { action, adminNotes, rejectionReason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
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

    if (existingOrder.status !== 'payment_received') {
      return NextResponse.json(
        { error: 'Order cannot be approved/rejected. It must be in "payment_received" status.' },
        { status: 400 }
      );
    }

    let updateData: any = {
      adminNotes: adminNotes || null,
      updatedAt: new Date(),
    };

    if (action === 'approve') {
      // Order accepted by admin - ready for processing/shipping
      updateData.status = 'accepted'; // Order accepted by admin
      updateData.adminApprovedAt = new Date();

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
      updateData.status = 'rejected'; // Order rejected
      updateData.rejectionReason = rejectionReason;

      console.log('Order rejected by admin:', {
        orderId,
        rejectionReason,
        rejectedAt: new Date(),
      });
    }

    await db
      .update(order)
      .set(updateData)
      .where(eq(order.id, orderId));

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? 'Order accepted! Ready for processing.'
        : 'Order rejected. Customer will be notified for refund.',
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
