import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminSession, logAdminAction } from '@/lib/auth';
import { OrderStatus } from '@/types';

// Valid transitions validation matrix
const VALID_DELIVERY_TRANSITIONS: Record<string, string[]> = {
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [], // Terminal
  cancelled: [], // Terminal
};

const VALID_PICKUP_TRANSITIONS: Record<string, string[]> = {
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const r = rows[0];
    return NextResponse.json({
      order: {
        id: r.id,
        createdAt: r.created_at ? new Date(r.created_at).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }) : 'Just now',
        customerName: r.customer_name,
        phone: r.phone,
        email: r.email,
        deliveryAddress: r.delivery_address,
        landmark: r.landmark,
        paymentMethod: r.payment_method,
        paymentSubOption: r.payment_sub_option,
        subtotal: Number(r.subtotal),
        deliveryCharge: Number(r.delivery_charge),
        tax: Number(r.tax),
        total: Number(r.total),
        status: r.status,
        orderType: r.order_type,
        estimatedTime: r.estimated_time,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items || [],
        timeline: typeof r.timeline === 'string' ? JSON.parse(r.timeline) : r.timeline || [],
      },
    });
  } catch (error) {
    console.error('Admin order detail GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch order detail' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = decodeURIComponent(id);
    const normalizedId = orderId.startsWith('#') ? orderId : `#${orderId}`;

    const body = await request.json();
    const { status: targetStatus } = body as { status: OrderStatus };

    if (!targetStatus) {
      return NextResponse.json({ error: 'New status is required' }, { status: 400 });
    }

    const sql = getDb();
    const existing = await sql`
      SELECT * FROM orders 
      WHERE id = ${normalizedId} OR id = ${orderId} 
      LIMIT 1;
    `;

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentOrder = existing[0];
    const currentStatus = currentOrder.status;
    const isPickup = currentOrder.order_type === 'pickup';

    // Transition safety verification (Super Admin can override if needed, but staff/manager follow workflow)
    if (session.user.role !== 'super_admin') {
      const allowedNext = isPickup
        ? VALID_PICKUP_TRANSITIONS[currentStatus] || []
        : VALID_DELIVERY_TRANSITIONS[currentStatus] || [];

      if (!allowedNext.includes(targetStatus) && currentStatus !== targetStatus) {
        return NextResponse.json(
          {
            error: `Invalid transition from "${currentStatus}" to "${targetStatus}". Allowed next steps: ${allowedNext.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Build updated timeline
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let timeline = typeof currentOrder.timeline === 'string'
      ? JSON.parse(currentOrder.timeline)
      : currentOrder.timeline || [];

    const statusHierarchy = isPickup
      ? ['confirmed', 'preparing', 'ready_for_pickup', 'delivered']
      : ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];

    const targetIdx = statusHierarchy.indexOf(targetStatus);

    timeline = timeline.map((step: any) => {
      const stepIdx = statusHierarchy.indexOf(step.status);
      return {
        ...step,
        completed: stepIdx <= targetIdx,
        current: step.status === targetStatus,
        time: step.status === targetStatus ? nowStr : step.time,
      };
    });

    const newEstimatedTime = targetStatus === 'delivered'
      ? 'Delivered'
      : targetStatus === 'out_for_delivery' || targetStatus === 'ready_for_pickup'
      ? '5–10 mins'
      : targetStatus === 'preparing'
      ? '15–20 mins'
      : '30–35 mins';

    await sql`
      UPDATE orders 
      SET 
        status = ${targetStatus},
        estimated_time = ${newEstimatedTime},
        timeline = ${JSON.stringify(timeline)}::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${normalizedId} OR id = ${orderId};
    `;

    // Audit log
    await logAdminAction(
      session.user.id,
      session.user.name,
      'UPDATE_ORDER_STATUS',
      'order',
      normalizedId,
      { from: currentStatus, to: targetStatus }
    );

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${targetStatus}`,
      status: targetStatus,
    });
  } catch (error) {
    console.error('Admin order PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
