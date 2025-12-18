import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { order as orderTable, product as productTable, user, orderItem } from "@/drizzle/schema";
import { desc, sql, eq, sum, count } from "drizzle-orm";

export async function GET() {
  try {
    // Get total revenue
    const revenueResult = await db
      .select({
        total: sum(orderTable.total),
      })
      .from(orderTable)
      .where(eq(orderTable.status, "completed"));

    const totalRevenue = Number(revenueResult[0]?.total || 0);

    // Get total orders
    const orderCountResult = await db
      .select({
        count: count(),
      })
      .from(orderTable);

    const totalSales = orderCountResult[0]?.count || 0;

    // Get total customers
    const customerCountResult = await db
      .select({
        count: count(),
      })
      .from(user)
      .where(eq(user.role, "user"));

    const newCustomers = customerCountResult[0]?.count || 0;

    // Get low stock products (stock < 10)
    const lowStockResult = await db
      .select({
        count: count(),
      })
      .from(productTable)
      .where(sql`${productTable.stock} < 10`);

    const lowStockProducts = lowStockResult[0]?.count || 0;

    // Get recent orders
    const recentOrdersData = await db
      .select({
        id: orderTable.id,
        customerName: user.name,
        customerEmail: user.email,
        total: orderTable.total,
        status: orderTable.status,
      })
      .from(orderTable)
      .leftJoin(user, eq(orderTable.userId, user.id))
      .orderBy(desc(orderTable.createdAt))
      .limit(5);

    // Get top products (most ordered items)
    const topProductsData = await db
      .select({
        name: productTable.name,
        sold: count(orderItem.id),
      })
      .from(productTable)
      .leftJoin(orderItem, eq(productTable.id, orderItem.productId))
      .groupBy(productTable.id, productTable.name)
      .orderBy(desc(count(orderItem.id)))
      .limit(5);

    return NextResponse.json({
      totalRevenue,
      totalSales,
      newCustomers,
      lowStockProducts,
      recentOrders: recentOrdersData.map((order) => ({
        id: order.id,
        customerName: order.customerName || "Unknown Customer",
        customerEmail: order.customerEmail || "N/A",
        total: Number(order.total || 0),
        status: order.status || "pending",
      })),
      topProducts: topProductsData.map((product) => ({
        name: product.name,
        sold: product.sold || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
