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
    const deliveryPersonId = searchParams.get('deliveryPersonId');
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 200);
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

    const sql = getDb();
    let rows;

    if (status && status !== 'all' && deliveryPersonId) {
      rows = await sql`
        SELECT 
          o.*,
          d.name as delivery_person_name,
          d.phone as delivery_person_phone
        FROM orders o
        LEFT JOIN delivery_persons d ON o.delivery_person_id = d.id
        WHERE o.status = ${status} AND o.delivery_person_id = ${deliveryPersonId}
        ORDER BY o.created_at DESC 
        LIMIT ${limit} OFFSET ${offset};
      `;
    } else if (status && status !== 'all') {
      rows = await sql`
        SELECT 
          o.*,
          d.name as delivery_person_name,
          d.phone as delivery_person_phone
        FROM orders o
        LEFT JOIN delivery_persons d ON o.delivery_person_id = d.id
        WHERE o.status = ${status}
        ORDER BY o.created_at DESC 
        LIMIT ${limit} OFFSET ${offset};
      `;
    } else if (deliveryPersonId) {
      rows = await sql`
        SELECT 
          o.*,
          d.name as delivery_person_name,
          d.phone as delivery_person_phone
        FROM orders o
        LEFT JOIN delivery_persons d ON o.delivery_person_id = d.id
        WHERE o.delivery_person_id = ${deliveryPersonId}
        ORDER BY o.created_at DESC 
        LIMIT ${limit} OFFSET ${offset};
      `;
    } else {
      rows = await sql`
        SELECT 
          o.*,
          d.name as delivery_person_name,
          d.phone as delivery_person_phone
        FROM orders o
        LEFT JOIN delivery_persons d ON o.delivery_person_id = d.id
        ORDER BY o.created_at DESC 
        LIMIT ${limit} OFFSET ${offset};
      `;
    }

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r: any) =>
        r.id.toLowerCase().includes(q) ||
        (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
        (r.phone && r.phone.toLowerCase().includes(q)) ||
        (r.delivery_person_name && r.delivery_person_name.toLowerCase().includes(q)) ||
        (r.island && r.island.toLowerCase().includes(q)) ||
        (r.house_name && r.house_name.toLowerCase().includes(q))
      );
    }

    const totalCountRes = await sql`SELECT count(*) as count FROM orders;`;

    return NextResponse.json({
      orders: rows.map((r: any) => ({
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
        island: r.island || 'Amini',
        houseName: r.house_name || '',
        locality: r.locality || '',
        landmark: r.landmark || '',
        deliveryInstructions: r.delivery_instructions || '',
        deliveryPersonId: r.delivery_person_id,
        deliveryPersonName: r.delivery_person_name,
        deliveryPersonPhone: r.delivery_person_phone,
        deliveryStatus: r.delivery_status || 'unassigned',
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
