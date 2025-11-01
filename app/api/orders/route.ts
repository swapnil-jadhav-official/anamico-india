import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { order, orderItem, cartItem } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}${random}`;
}

/**
 * POST /api/orders
 * Create a new order with partial payment
 * After payment, order status will be 'payment_received' and awaits admin approval
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { shippingData, items, subtotal } = body;

    // Validate required fields
    if (!shippingData || !items || !subtotal) {
      return NextResponse.json(
        { error: 'Missing required fields: shippingData, items, subtotal' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate shipping data
    const { name, email, phone, address, city, state, pincode } = shippingData;
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'Incomplete shipping information' },
        { status: 400 }
      );
    }

    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + tax;

    console.log('Creating order:', {
      orderId,
      orderNumber,
      userId: session.user.id,
      subtotal,
      tax,
      total,
      itemsCount: items.length,
    });

    // Create order with status 'pending' - waiting for payment
    await db.insert(order).values({
      id: orderId,
      userId: session.user.id,
      orderNumber,
      subtotal,
      tax,
      total,
      status: 'pending', // Initial status
      paymentStatus: 'pending', // Waiting for payment
      paidAmount: 0,
      shippingName: name,
      shippingEmail: email,
      shippingPhone: phone,
      shippingAddress: address,
      shippingCity: city,
      shippingState: state,
      shippingPincode: pincode,
    });

    // Create order items
    const orderItemsToInsert = items.map((item: any) => ({
      id: uuidv4(),
      orderId,
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    await db.insert(orderItem).values(orderItemsToInsert);

    // Clear user's cart
    await db
      .delete(cartItem)
      .where(eq(cartItem.userId, session.user.id));

    console.log('Order created successfully:', orderId);

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      orderData: {
        id: orderId,
        orderNumber,
        subtotal,
        tax,
        total,
        status: 'pending',
        shippingData: {
          name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
        },
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create order: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Fetch user's orders
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's orders with items
    const userOrders = await db
      .select()
      .from(order)
      .where(eq(order.userId, session.user.id));

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      userOrders.map(async (ord) => {
        const items = await db
          .select()
          .from(orderItem)
          .where(eq(orderItem.orderId, ord.id));

        return {
          ...ord,
          items,
        };
      })
    );

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
