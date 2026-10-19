import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getDb();

    // 1. All orders
    const allOrders = await sql`
      SELECT id, total, status, created_at, items 
      FROM orders 
      ORDER BY created_at DESC;
    `;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let todayRevenue = 0;
    let todayOrdersCount = 0;
    let pendingOrdersCount = 0;
    let totalRevenue = 0;

    const statusCounts: Record<string, number> = {
      confirmed: 0,
      preparing: 0,
      out_for_delivery: 0,
      ready_for_pickup: 0,
      delivered: 0,
      cancelled: 0,
    };

    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const o of allOrders) {
      const orderDate = new Date(o.created_at);
      const orderTotal = Number(o.total) || 0;
      totalRevenue += orderTotal;

      if (orderDate >= startOfToday) {
        todayRevenue += orderTotal;
        todayOrdersCount += 1;
      }

      if (['confirmed', 'preparing', 'out_for_delivery', 'ready_for_pickup'].includes(o.status)) {
        pendingOrdersCount += 1;
      }

      if (o.status in statusCounts) {
        statusCounts[o.status] += 1;
      }

      // Count items
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items || [];
      if (Array.isArray(items)) {
        for (const item of items) {
          const name = item.foodItem?.name || 'Dish';
          const qty = Number(item.quantity) || 1;
          const rev = Number(item.itemTotal) || 0;
          if (!itemSales[name]) {
            itemSales[name] = { name, quantity: 0, revenue: 0 };
          }
          itemSales[name].quantity += qty;
          itemSales[name].revenue += rev;
        }
      }
    }

    // Top 5 popular items
    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Total unique customers
    const customersCountRes = await sql`SELECT count(*) as count FROM customers;`;
    const totalCustomers = Number(customersCountRes[0]?.count || 0) || Math.max(allOrders.length, 1);

    // Unavailable / Low availability items
    const unavailableItems = await sql`
      SELECT id, name, category_id, price, available 
      FROM menu_items 
      WHERE available = false AND deleted_at IS NULL;
    `;

    // 7 Days Chart Data
    const daysMap: Record<string, { day: string; date: string; revenue: number; orders: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[dateKey] = { day: dayName, date: dateKey, revenue: 0, orders: 0 };
    }

    for (const o of allOrders) {
      const orderDate = new Date(o.created_at);
      if (orderDate >= sevenDaysAgo) {
        const key = orderDate.toISOString().split('T')[0];
        if (daysMap[key]) {
          daysMap[key].revenue += Number(o.total) || 0;
          daysMap[key].orders += 1;
        }
      }
    }

    const chart7Days = Object.values(daysMap);

    return NextResponse.json({
      metrics: {
        todayOrders: todayOrdersCount,
        todayRevenue,
        pendingOrders: pendingOrdersCount,
        totalCustomers,
        totalOrders: allOrders.length,
        totalRevenue,
        averageOrderValue: allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0,
      },
      statusDistribution: statusCounts,
      popularItems: topSellingItems,
      unavailableItems,
      salesChart: chart7Days,
    });
  } catch (error) {
    console.error('Admin analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to calculate analytics' }, { status: 500 });
  }
}
