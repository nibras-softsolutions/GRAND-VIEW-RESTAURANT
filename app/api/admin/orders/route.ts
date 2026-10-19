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
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

    const sql = getDb();
    let rows;

    if (status && status !== 'all') {
      rows = await sql`
        SELECT * FROM orders 
        WHERE status = ${status}
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset};
      `;
    } else {
      rows = await sql`
        SELECT * FROM orders 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset};
      `;
    }

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
        (r.phone && r.phone.toLowerCase().includes(q))
      );
    }

    const totalCountRes = await sql`SELECT count(*) as count FROM orders;`;

    return NextResponse.json({
      orders: rows.map((r) => ({
        id: r.id,
        createdAt: r.created_at ? new Date(r.created_at).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }) : 'Just now',
        rawCreatedAt: r.created_at,
        customerName: r.customer_name,
        phone: r.phone,
        email: r.email,
        deliveryAddress: r.delivery_address,
        landmark: r.landmark,
        paymentMethod: r.payment_method,
        subtotal: Number(r.subtotal),
        deliveryCharge: Number(r.delivery_charge),
        tax: Number(r.tax),
        total: Number(r.total),
        status: r.status,
        orderType: r.order_type,
        estimatedTime: r.estimated_time,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items || [],
        timeline: typeof r.timeline === 'string' ? JSON.parse(r.timeline) : r.timeline || [],
      })),
      total: Number(totalCountRes[0]?.count || 0),
    });
  } catch (error) {
    console.error('Admin orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
