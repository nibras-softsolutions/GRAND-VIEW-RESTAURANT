import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getDeliverySession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getDeliverySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getDb();
    const rows = await sql`
      SELECT id, name, phone, vehicle_info, active, last_login_at, created_at
      FROM delivery_persons
      WHERE id = ${session.deliveryPerson.id}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: rows[0] });
  } catch (error) {
    console.error('Delivery profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getDeliverySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, vehicle_info, current_password, new_password } = body;
    const sql = getDb();

    // Validate phone number if provided
    const cleanPhone = phone?.trim();
    if (cleanPhone) {
      const existingWithPhone = await sql`
        SELECT id FROM delivery_persons 
        WHERE phone = ${cleanPhone} AND id != ${session.deliveryPerson.id} 
        LIMIT 1;
      `;
      if (existingWithPhone.length > 0) {
        return NextResponse.json(
          { error: 'This phone number is already registered to another delivery person.' },
          { status: 400 }
        );
      }
    }

    // If changing password, verify current password
    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ error: 'Current password is required to set new password.' }, { status: 400 });
      }

      const rows = await sql`SELECT password_hash FROM delivery_persons WHERE id = ${session.deliveryPerson.id} LIMIT 1;`;
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Delivery person not found.' }, { status: 404 });
      }

      const isValid = await bcrypt.compare(current_password, rows[0].password_hash);
      if (!isValid) {
        return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
      }

      const newHash = await bcrypt.hash(new_password, 10);
      await sql`
        UPDATE delivery_persons 
        SET 
          name = COALESCE(${name}, name),
          phone = COALESCE(${cleanPhone}, phone),
          vehicle_info = COALESCE(${vehicle_info}, vehicle_info),
          password_hash = ${newHash},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${session.deliveryPerson.id};
      `;
    } else {
      await sql`
        UPDATE delivery_persons 
        SET 
          name = COALESCE(${name}, name),
          phone = COALESCE(${cleanPhone}, phone),
          vehicle_info = COALESCE(${vehicle_info}, vehicle_info),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${session.deliveryPerson.id};
      `;
    }

    const updated = await sql`
      SELECT id, name, phone, vehicle_info, active, last_login_at, created_at
      FROM delivery_persons
      WHERE id = ${session.deliveryPerson.id}
      LIMIT 1;
    `;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updated[0],
    });
  } catch (error) {
    console.error('Delivery profile PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
