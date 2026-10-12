import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { order, orderItem, product } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the most recent order for this user
    const userOrders = await db
      .select()
      .from(order)
      .where(eq(order.userId, session.user.id))
      .orderBy(order.createdAt);

    if (userOrders.length === 0) {
      return NextResponse.json({ error: 'No orders found' }, { status: 404 });
    }

    const latestOrder = userOrders[userOrders.length - 1];

    // Get order items
    const items = await db
      .select()
      .from(orderItem)
      .where(eq(orderItem.orderId, latestOrder.id));

    // Get current product tax percentages
    const productsData = await Promise.all(
      items.map(async (item) => {
        const prod = await db
          .select()
          .from(product)
          .where(eq(product.id, item.productId))
          .limit(1);
        return {
          orderItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          orderItem_taxPercentage: item.taxPercentage,
          product_taxPercentage: prod[0]?.taxPercentage || 'N/A',
          itemSubtotal: item.price * item.quantity,
          calculatedTax: Math.round(item.price * item.quantity * (item.taxPercentage / 100)),
        };
      })
    );

    // Calculate totals
    const calculatedSubtotal = productsData.reduce((sum, item) => sum + item.itemSubtotal, 0);
    const calculatedTax = productsData.reduce((sum, item) => sum + item.calculatedTax, 0);
    const effectiveTaxPercent = calculatedSubtotal > 0
      ? Math.round((latestOrder.tax / latestOrder.subtotal) * 100 * 10) / 10
      : 0;

    return NextResponse.json({
      orderInfo: {
        orderId: latestOrder.id,
        orderNumber: latestOrder.orderNumber,
        subtotal: latestOrder.subtotal,
        tax: latestOrder.tax,
        total: latestOrder.total,
        effectiveTaxPercent,
        createdAt: latestOrder.createdAt,
      },
      items: productsData,
      calculations: {
        calculatedSubtotal,
        calculatedTax,
        storedSubtotal: latestOrder.subtotal,
        storedTax: latestOrder.tax,
        subtotalMatch: calculatedSubtotal === latestOrder.subtotal,
        taxMatch: calculatedTax === latestOrder.tax,
        effectiveTaxFromStoredValues: effectiveTaxPercent,
      }
    });
  } catch (error) {
    console.error('Error debugging tax:', error);
    return NextResponse.json(
      { error: 'Failed to debug tax data' },
      { status: 500 }
    );
  }
}
