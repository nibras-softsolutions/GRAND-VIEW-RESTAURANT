import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Order, OrderStatus } from '@/types';

// Helper to format DB row to Order object
function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    createdAt: row.created_at ? new Date(row.created_at).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) : 'Just now',
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
    subtotal: Number(row.subtotal),
    deliveryCharge: Number(row.delivery_charge),
    tax: Number(row.tax),
    total: Number(row.total),
    orderType: row.order_type,
    deliveryAddress: row.delivery_address || '',
    landmark: row.landmark || '',
    customerName: row.customer_name,
    guestName: row.customer_name,
    roomNumber: row.landmark || '',
    phone: row.phone,
    paymentMethod: row.payment_method,
    paymentSubOption: row.payment_sub_option,
    status: row.status,
    estimatedTime: row.estimated_time || (row.order_type === 'pickup' ? '15–20 mins' : '30–35 mins'),
    timeline: typeof row.timeline === 'string' ? JSON.parse(row.timeline) : row.timeline || [],
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = decodeURIComponent(id);
    const normalizedId = orderId.startsWith('#') ? orderId : `#${orderId}`;

    const sql = getDb();
    const rows = await sql`
      SELECT * FROM orders 
      WHERE id = ${normalizedId} OR id = ${orderId}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order: mapRowToOrder(rows[0]) });
  } catch (error) {
    console.error('Failed to get order from Neon:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order', details: error instanceof Error ? error.message : 'DB error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = decodeURIComponent(id);
    const normalizedId = orderId.startsWith('#') ? orderId : `#${orderId}`;

    const body = await request.json();
    const { status, timeline } = body as { status?: OrderStatus; timeline?: any[] };

    const sql = getDb();

    if (timeline && status) {
      await sql`
        UPDATE orders 
        SET status = ${status}, 
            timeline = ${JSON.stringify(timeline)}::jsonb,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${normalizedId} OR id = ${orderId};
      `;
    } else if (status) {
      await sql`
        UPDATE orders 
        SET status = ${status}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${normalizedId} OR id = ${orderId};
      `;
    }

    const rows = await sql`
      SELECT * FROM orders 
      WHERE id = ${normalizedId} OR id = ${orderId}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: mapRowToOrder(rows[0]) });
  } catch (error) {
    console.error('Failed to update order in Neon:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : 'DB error' },
      { status: 500 }
    );
  }
}
