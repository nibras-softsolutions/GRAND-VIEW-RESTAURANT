import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Order } from '@/types';

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
    guestName: row.customer_name, // backward compatibility
    roomNumber: row.landmark || '', // backward compatibility
    phone: row.phone,
    paymentMethod: row.payment_method,
    paymentSubOption: row.payment_sub_option,
    status: row.status,
    estimatedTime: row.estimated_time || (row.order_type === 'pickup' ? '15–20 mins' : '30–35 mins'),
    timeline: typeof row.timeline === 'string' ? JSON.parse(row.timeline) : row.timeline || [],
  };
}

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM orders 
      ORDER BY created_at DESC 
      LIMIT 50;
    `;
    const orders = rows.map(mapRowToOrder);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Failed to fetch orders from Neon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'DB error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const orderData: Order = await request.json();
    const sql = getDb();

    const orderId = orderData.id || `#GV${Date.now().toString().slice(-6)}`;
    const itemsJson = JSON.stringify(orderData.items || []);
    const timelineJson = JSON.stringify(orderData.timeline || []);

    await sql`
      INSERT INTO orders (
        id,
        order_type,
        status,
        customer_name,
        phone,
        email,
        delivery_address,
        landmark,
        payment_method,
        payment_sub_option,
        subtotal,
        delivery_charge,
        tax,
        total,
        estimated_time,
        items,
        timeline
      ) VALUES (
        ${orderId},
        ${orderData.orderType || 'delivery'},
        ${orderData.status || 'confirmed'},
        ${orderData.customerName || orderData.guestName || 'Valued Customer'},
        ${orderData.phone || ''},
        ${orderData.phone || ''},
        ${orderData.deliveryAddress || ''},
        ${orderData.landmark || ''},
        ${orderData.paymentMethod || 'cash-on-delivery'},
        ${orderData.paymentSubOption || null},
        ${orderData.subtotal || 0},
        ${orderData.deliveryCharge || 0},
        ${orderData.tax || 0},
        ${orderData.total || 0},
        ${orderData.estimatedTime || '30–35 mins'},
        ${itemsJson}::jsonb,
        ${timelineJson}::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        timeline = EXCLUDED.timeline,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return NextResponse.json({
      success: true,
      order: {
        ...orderData,
        id: orderId,
      },
    });
  } catch (error) {
    console.error('Failed to create order in Neon:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'DB error' },
      { status: 500 }
    );
  }
}
