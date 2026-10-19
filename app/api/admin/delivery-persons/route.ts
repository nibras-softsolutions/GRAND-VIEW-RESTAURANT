import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { getAdminSession, logAdminAction } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getDb();
    const rows = await sql`
      SELECT 
        d.id,
        d.name,
        d.phone,
        d.vehicle_info,
        d.active,
        d.last_login_at,
        d.created_at,
        COUNT(o.id) FILTER (WHERE o.status IN ('confirmed', 'preparing', 'ready', 'ready_for_pickup', 'out_for_delivery')) as active_orders_count
      FROM delivery_persons d
      LEFT JOIN orders o ON o.delivery_person_id = d.id
      GROUP BY d.id
      ORDER BY d.created_at ASC;
    `;

    const deliveryPersons = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      vehicleInfo: r.vehicle_info,
      active: Boolean(r.active),
      lastLoginAt: r.last_login_at,
      createdAt: r.created_at,
      activeOrdersCount: Number(r.active_orders_count || 0),
    }));

    return NextResponse.json({ deliveryPersons });
  } catch (error) {
    console.error('Admin delivery-persons GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery staff' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, password, vehicle_info } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'Name, phone number, and password are required.' },
        { status: 400 }
      );
    }

    const sql = getDb();
    const id = `deliv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const passwordHash = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO delivery_persons (id, name, phone, password_hash, vehicle_info, active)
      VALUES (${id}, ${name}, ${phone.trim()}, ${passwordHash}, ${vehicle_info || ''}, true);
    `;

    await logAdminAction(
      session.user.id,
      session.user.name,
      'CREATE_DELIVERY_PERSON',
      'delivery_person',
      id,
      { name, phone, vehicle_info }
    );

    return NextResponse.json({
      success: true,
      deliveryPerson: { id, name, phone, vehicleInfo: vehicle_info, active: true },
    });
  } catch (error: any) {
    console.error('Admin delivery-persons POST error:', error);
    if (error?.message?.includes('duplicate key') || error?.message?.includes('unique constraint')) {
      return NextResponse.json({ error: 'A delivery person with this phone number already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create delivery person.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, active, password, vehicle_info, name, phone } = body;

    if (!id) {
      return NextResponse.json({ error: 'Delivery person ID required.' }, { status: 400 });
    }

    const sql = getDb();

    if (typeof active === 'boolean') {
      await sql`
        UPDATE delivery_persons 
        SET active = ${active}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
      await logAdminAction(
        session.user.id,
        session.user.name,
        active ? 'ACTIVATE_DELIVERY_PERSON' : 'DEACTIVATE_DELIVERY_PERSON',
        'delivery_person',
        id
      );
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await sql`
        UPDATE delivery_persons 
        SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
      await logAdminAction(
        session.user.id,
        session.user.name,
        'RESET_DELIVERY_PASSWORD',
        'delivery_person',
        id
      );
    }

    if (vehicle_info !== undefined || name || phone) {
      await sql`
        UPDATE delivery_persons 
        SET 
          vehicle_info = COALESCE(${vehicle_info}, vehicle_info),
          name = COALESCE(${name}, name),
          phone = COALESCE(${phone}, phone),
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
    }

    return NextResponse.json({ success: true, message: 'Delivery person updated.' });
  } catch (error) {
    console.error('Admin delivery-persons PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update delivery person.' }, { status: 500 });
  }
}
