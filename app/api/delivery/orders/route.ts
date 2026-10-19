import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getDeliverySession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getDeliverySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // 'active', 'completed', 'all'
    const sql = getDb();

    let query;
    if (filter === 'active') {
      query = await sql`
        SELECT 
          id, order_type, status, customer_name, phone, email,
          delivery_address, island, house_name, locality, landmark, delivery_instructions,
          payment_method, payment_sub_option, subtotal, delivery_charge, tax, total,
          estimated_time, items, timeline, delivery_status, created_at, updated_at
        FROM orders
        WHERE delivery_person_id = ${session.deliveryPerson.id}
          AND status IN ('confirmed', 'preparing', 'ready', 'ready_for_pickup', 'out_for_delivery')
        ORDER BY created_at DESC;
      `;
    } else if (filter === 'completed') {
      query = await sql`
        SELECT 
          id, order_type, status, customer_name, phone, email,
          delivery_address, island, house_name, locality, landmark, delivery_instructions,
          payment_method, payment_sub_option, subtotal, delivery_charge, tax, total,
          estimated_time, items, timeline, delivery_status, created_at, updated_at
        FROM orders
        WHERE delivery_person_id = ${session.deliveryPerson.id}
          AND status = 'delivered'
        ORDER BY updated_at DESC;
      `;
    } else {
      query = await sql`
        SELECT 
          id, order_type, status, customer_name, phone, email,
          delivery_address, island, house_name, locality, landmark, delivery_instructions,
          payment_method, payment_sub_option, subtotal, delivery_charge, tax, total,
          estimated_time, items, timeline, delivery_status, created_at, updated_at
        FROM orders
        WHERE delivery_person_id = ${session.deliveryPerson.id}
        ORDER BY created_at DESC;
      `;
    }

    const formattedOrders = query.map((row: any) => ({
      id: row.id,
      orderType: row.order_type,
      status: row.status,
      customerName: row.customer_name,
      phone: row.phone,
      email: row.email,
      deliveryAddress: row.delivery_address,
      island: row.island || 'Amini',
      houseName: row.house_name || '',
      locality: row.locality || '',
      landmark: row.landmark || '',
      deliveryInstructions: row.delivery_instructions || '',
      paymentMethod: row.payment_method,
      paymentSubOption: row.payment_sub_option,
      subtotal: Number(row.subtotal),
      deliveryCharge: Number(row.delivery_charge),
      tax: Number(row.tax),
      total: Number(row.total),
      estimatedTime: row.estimated_time || '30 mins',
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
      timeline: typeof row.timeline === 'string' ? JSON.parse(row.timeline) : row.timeline || [],
      deliveryStatus: row.delivery_status || 'assigned',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({
      orders: formattedOrders,
      activeCount: formattedOrders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length,
      completedCount: formattedOrders.filter((o: any) => o.status === 'delivered').length,
    });
  } catch (error) {
    console.error('Delivery orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch assigned orders.' }, { status: 500 });
  }
}
