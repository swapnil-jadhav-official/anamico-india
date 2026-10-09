import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';
import { product, order, orderItem, cartItem, banner } from '@/drizzle/schema';

/**
 * Admin-only API endpoint to clean database
 * DELETE /api/admin/cleanup-db
 *
 * Removes all products, orders, cart items, and banners
 * KEEPS users intact for authentication
 *
 * IMPORTANT: Only accessible by admin users
 */
export async function DELETE(req: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const results = {
      cartItems: 0,
      orderItems: 0,
      orders: 0,
      products: 0,
      banners: 0,
    };

    // 1. Delete cart items
    await db.delete(cartItem);
    results.cartItems = 1;

    // 2. Delete order items (must be before orders)
    await db.delete(orderItem);
    results.orderItems = 1;

    // 3. Delete orders
    await db.delete(order);
    results.orders = 1;

    // 4. Delete products
    await db.delete(product);
    results.products = 1;

    // 5. Delete banners
    await db.delete(banner);
    results.banners = 1;

    return NextResponse.json(
      {
        success: true,
        message: 'Database cleaned successfully',
        deleted: results,
        note: 'Users were kept intact for authentication',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error cleaning database:', error);
    return NextResponse.json(
      {
        error: 'Failed to clean database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
