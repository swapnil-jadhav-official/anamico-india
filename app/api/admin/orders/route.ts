import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { order, orderItem, user as userTable } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

/**
 * GET /api/admin/orders
 * Fetch all orders (optionally filtered by status)
 * Query params: ?status=payment_received&limit=10&offset=0
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'payment_received'; // Default: pending approval orders
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('Fetching orders for admin:', { status, limit, offset });

    // Fetch all orders with the specified status
    let ordersQuery = db.select().from(order);

    if (status) {
      ordersQuery = ordersQuery.where(eq(order.status, status));
    }

    const allOrders = await ordersQuery;

    // Apply pagination
    const paginatedOrders = allOrders.slice(offset, offset + limit);

    // Fetch order items and user details for each order
    const ordersWithDetails = await Promise.all(
      paginatedOrders.map(async (ord) => {
        const items = await db
          .select()
          .from(orderItem)
          .where(eq(orderItem.orderId, ord.id));

        const [userData] = await db
          .select()
          .from(userTable)
          .where(eq(userTable.id, ord.userId));

        return {
          ...ord,
          items,
          user: {
            id: userData?.id,
            name: userData?.name,
            email: userData?.email,
            phone: userData?.phone,
          },
        };
      })
    );

    return NextResponse.json({
      data: ordersWithDetails,
      pagination: {
        total: allOrders.length,
        limit,
        offset,
        returned: ordersWithDetails.length,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
