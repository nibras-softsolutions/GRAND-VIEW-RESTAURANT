import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminSession, logAdminAction, logOrderStatusTransition } from '@/lib/auth';
import { OrderStatus } from '@/types';

// Valid transitions validation matrix
const VALID_DELIVERY_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'rejected'],
  confirmed: ['preparing', 'ready', 'rejected'],
  preparing: ['ready', 'out_for_delivery', 'rejected'],
  ready: ['out_for_delivery', 'delivered', 'rejected'],
  out_for_delivery: ['delivered', 'rejected'],
  delivered: [], // Terminal
  rejected: [],  // Terminal
};

const VALID_PICKUP_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'rejected'],
  confirmed: ['preparing', 'ready_for_pickup', 'rejected'],
  preparing: ['ready_for_pickup', 'delivered', 'rejected'],
  ready_for_pickup: ['delivered', 'rejected'],
  delivered: [],
  rejected: [],
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
      SELECT 
        o.*,
        d.name as delivery_person_name,
        d.phone as delivery_person_phone,
        d.vehicle_info as delivery_person_vehicle
      FROM orders o
      LEFT JOIN delivery_persons d ON o.delivery_person_id = d.id
      WHERE o.id = ${normalizedId} OR o.id = ${orderId} 
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const r = rows[0];

    // Fetch status history
    const historyRows = await sql`
      SELECT status, actor_role, actor_name, notes, created_at 
      FROM order_status_history 
      WHERE order_id = ${r.id} 
      ORDER BY created_at ASC;
    `;

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
        island: r.island || 'Amini',
        houseName: r.house_name || '',
        locality: r.locality || '',
        landmark: r.landmark || '',
        deliveryInstructions: r.delivery_instructions || '',
        deliveryPersonId: r.delivery_person_id,
        deliveryPersonName: r.delivery_person_name,
        deliveryPersonPhone: r.delivery_person_phone,
        deliveryPersonVehicle: r.delivery_person_vehicle,
        deliveryStatus: r.delivery_status || 'unassigned',
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
        history: historyRows,
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
    const { status: targetStatus, delivery_person_id } = body;

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

    // 1. Assign Delivery Person
    if (delivery_person_id !== undefined) {
      if (delivery_person_id) {
        // Verify active
        const dRows = await sql`SELECT id, name, phone, active FROM delivery_persons WHERE id = ${delivery_person_id} LIMIT 1;`;
        if (dRows.length === 0 || !dRows[0].active) {
          return NextResponse.json({ error: 'Selected delivery person is not active or does not exist.' }, { status: 400 });
        }

        const dp = dRows[0];
        await sql`
          UPDATE orders 
          SET 
            delivery_person_id = ${dp.id},
            delivery_status = 'assigned',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${currentOrder.id};
        `;

        await logOrderStatusTransition(
          currentOrder.id,
          currentStatus,
          'admin',
          session.user.name,
          `Assigned to delivery partner ${dp.name} (${dp.phone})`
        );

        await logAdminAction(
          session.user.id,
          session.user.name,
          'ASSIGN_DELIVERY_PERSON',
          'order',
          currentOrder.id,
          { deliveryPersonId: dp.id, deliveryPersonName: dp.name }
        );
      } else {
        // Unassign
        await sql`
          UPDATE orders 
          SET 
            delivery_person_id = NULL,
            delivery_status = 'unassigned',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${currentOrder.id};
        `;
      }
    }

    // 2. Status Update
    if (targetStatus && targetStatus !== currentStatus) {
      const allowedNext = isPickup
        ? VALID_PICKUP_TRANSITIONS[currentStatus] || []
        : VALID_DELIVERY_TRANSITIONS[currentStatus] || [];

      if (!allowedNext.includes(targetStatus)) {
        return NextResponse.json(
          {
            error: `Invalid status transition from "${currentStatus}" to "${targetStatus}". Allowed next steps: ${allowedNext.join(', ')}`,
          },
          { status: 400 }
        );
      }

      // Build updated timeline
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let timeline = typeof currentOrder.timeline === 'string'
        ? JSON.parse(currentOrder.timeline)
        : currentOrder.timeline || [];

      const statusHierarchy = isPickup
        ? ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'delivered']
        : ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

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

      // If target status wasn't already in timeline (e.g. ready or rejected), append it
      if (!timeline.some((s: any) => s.status === targetStatus)) {
        timeline.push({
          status: targetStatus,
          title: targetStatus === 'rejected' ? 'Order Rejected' : targetStatus === 'ready' ? 'Ready for Dispatch' : targetStatus.replace(/_/g, ' '),
          description: targetStatus === 'rejected' ? 'Order was cancelled by restaurant.' : `Order marked as ${targetStatus}.`,
          time: nowStr,
          completed: true,
          current: true,
        });
      }

      const newEstimatedTime = targetStatus === 'delivered'
        ? 'Delivered'
        : targetStatus === 'out_for_delivery' || targetStatus === 'ready' || targetStatus === 'ready_for_pickup'
        ? '10–15 mins'
        : targetStatus === 'preparing'
        ? '15–20 mins'
        : targetStatus === 'rejected'
        ? 'Cancelled'
        : '30–35 mins';

      const newDeliveryStatus = targetStatus === 'out_for_delivery'
        ? 'out_for_delivery'
        : targetStatus === 'delivered'
        ? 'delivered'
        : currentOrder.delivery_status;

      await sql`
        UPDATE orders 
        SET 
          status = ${targetStatus},
          delivery_status = ${newDeliveryStatus},
          estimated_time = ${newEstimatedTime},
          timeline = ${JSON.stringify(timeline)}::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${currentOrder.id};
      `;

      await logOrderStatusTransition(
        currentOrder.id,
        targetStatus,
        'admin',
        session.user.name,
        `Status updated to ${targetStatus}`
      );

      await logAdminAction(
        session.user.id,
        session.user.name,
        'UPDATE_ORDER_STATUS',
        'order',
        currentOrder.id,
        { from: currentStatus, to: targetStatus }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully.',
      order: {
        id: currentOrder.id,
        status: targetStatus || currentStatus,
        delivery_person_id: delivery_person_id !== undefined ? delivery_person_id : currentOrder.delivery_person_id,
      },
    });
  } catch (error) {
    console.error('Admin order PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
