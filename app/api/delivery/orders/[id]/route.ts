import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getDeliverySession, logOrderStatusTransition } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getDeliverySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const cleanId = decodeURIComponent(id);
    const sql = getDb();

    // Query order ensuring it belongs to this delivery person
    const rows = await sql`
      SELECT 
        id, order_type, status, customer_name, phone, email,
        delivery_address, island, house_name, locality, landmark, delivery_instructions,
        payment_method, payment_sub_option, subtotal, delivery_charge, tax, total,
        estimated_time, items, timeline, delivery_person_id, delivery_status, created_at, updated_at
      FROM orders
      WHERE id = ${cleanId}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const row = rows[0];

    // Ensure delivery person can only see their own assigned order
    if (row.delivery_person_id !== session.deliveryPerson.id) {
      return NextResponse.json(
        { error: 'Forbidden: You are not assigned to this delivery.' },
        { status: 403 }
      );
    }

    const formattedOrder = {
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
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Delivery order detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch order details.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getDeliverySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const cleanId = decodeURIComponent(id);
    const body = await request.json();
    const { action, notes } = body; // action: 'start_delivery' | 'mark_delivered'

    const sql = getDb();

    // Verify order exists and is assigned to this delivery person
    const rows = await sql`
      SELECT id, status, timeline, delivery_person_id 
      FROM orders 
      WHERE id = ${cleanId} 
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const order = rows[0];
    if (order.delivery_person_id !== session.deliveryPerson.id) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot update an order not assigned to you.' },
        { status: 403 }
      );
    }

    let newStatus = order.status;
    let newDeliveryStatus = 'assigned';
    let timelineTitle = '';
    let timelineDesc = '';

    if (action === 'start_delivery') {
      newStatus = 'out_for_delivery';
      newDeliveryStatus = 'out_for_delivery';
      timelineTitle = 'Out for Delivery';
      timelineDesc = `${session.deliveryPerson.name} has started delivery to your address.`;
    } else if (action === 'mark_delivered') {
      newStatus = 'delivered';
      newDeliveryStatus = 'delivered';
      timelineTitle = 'Delivered';
      timelineDesc = `Order successfully handed over by ${session.deliveryPerson.name}. Bon Appétit!`;
    } else {
      return NextResponse.json({ error: 'Invalid delivery action.' }, { status: 400 });
    }

    // Update timeline
    let timeline = typeof order.timeline === 'string' ? JSON.parse(order.timeline) : order.timeline || [];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    timeline = timeline.map((step: any) => ({
      ...step,
      completed: true,
      current: false,
    }));

    timeline.push({
      status: newStatus,
      title: timelineTitle,
      description: timelineDesc,
      time: nowTime,
      completed: true,
      current: true,
    });

    await sql`
      UPDATE orders 
      SET 
        status = ${newStatus},
        delivery_status = ${newDeliveryStatus},
        timeline = ${JSON.stringify(timeline)}::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${cleanId};
    `;

    // Record in order status history
    await logOrderStatusTransition(
      cleanId,
      newStatus,
      'delivery',
      session.deliveryPerson.name,
      notes || `Delivery action: ${action}`
    );

    return NextResponse.json({
      success: true,
      status: newStatus,
      deliveryStatus: newDeliveryStatus,
      message: action === 'start_delivery' ? 'Delivery started.' : 'Order marked as delivered.',
      order: {
        id: cleanId,
        status: newStatus,
        deliveryStatus: newDeliveryStatus,
      },
    });
  } catch (error) {
    console.error('Delivery status update error:', error);
    return NextResponse.json({ error: 'Failed to update delivery status.' }, { status: 500 });
  }
}
