import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const sql = getDb();

    // Query aggregated customer metrics from actual orders table
    const orderAggregates = await sql`
      SELECT 
        customer_name,
        phone,
        email,
        COUNT(id) as total_orders,
        SUM(total) as total_spent,
        MAX(created_at) as last_order_date
      FROM orders 
      WHERE customer_name IS NOT NULL AND customer_name != ''
      GROUP BY customer_name, phone, email
      ORDER BY total_spent DESC;
    `;

    let customers = orderAggregates.map((c, idx) => ({
      id: `cust_${idx + 1}`,
      name: c.customer_name,
      phone: c.phone,
      email: c.email || 'N/A',
      totalOrders: Number(c.total_orders),
      totalSpent: Number(c.total_spent),
      lastOrder: c.last_order_date ? new Date(c.last_order_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) : 'Recent',
      status: 'Active',
    }));

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Admin customers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
