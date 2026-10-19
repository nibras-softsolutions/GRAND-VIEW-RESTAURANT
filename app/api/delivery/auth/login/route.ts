import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { createDeliverySession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Phone number and password are required.' },
        { status: 400 }
      );
    }

    const sql = getDb();
    const cleanPhone = phone.trim();

    // Query active delivery person by phone
    const rows = await sql`
      SELECT id, name, phone, password_hash, vehicle_info, active 
      FROM delivery_persons 
      WHERE (phone = ${cleanPhone} OR phone = ${cleanPhone.replace(/\s+/g, '')} OR phone = ${'+91 ' + cleanPhone.replace(/^\+91\s*/, '')})
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid phone number or password.' },
        { status: 401 }
      );
    }

    const person = rows[0];

    if (!person.active) {
      return NextResponse.json(
        { error: 'Your delivery account has been deactivated. Please contact restaurant admin.' },
        { status: 403 }
      );
    }

    const isValid = await bcrypt.compare(password, person.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid phone number or password.' },
        { status: 401 }
      );
    }

    // Create session & cookie
    await createDeliverySession({
      id: person.id,
      name: person.name,
      phone: person.phone,
      vehicleInfo: person.vehicle_info,
      active: Boolean(person.active),
    });

    return NextResponse.json({
      success: true,
      deliveryPerson: {
        id: person.id,
        name: person.name,
        phone: person.phone,
        vehicleInfo: person.vehicle_info,
      },
    });
  } catch (error) {
    console.error('Delivery login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
