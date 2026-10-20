import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, password, island, houseName, locality, landmark } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    if (!phone || !phone.trim() || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : `${cleanPhone.replace(/\D/g, '')}@grandview.local`;
    const cleanIsland = island || 'Amini';
    const cleanHouse = houseName || '';

    const sql = getDb();

    // Check if customer already exists with this phone
    const existing = await sql`
      SELECT id, phone, email FROM customers 
      WHERE phone = ${cleanPhone} OR (email = ${cleanEmail} AND email != '')
      LIMIT 1;
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An account with this phone number or email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const customerId = `cust_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Insert customer
    await sql`
      INSERT INTO customers (
        id, name, phone, email, password_hash, island, house_name, preferences, created_at, updated_at
      ) VALUES (
        ${customerId},
        ${name.trim()},
        ${cleanPhone},
        ${cleanEmail},
        ${passwordHash},
        ${cleanIsland},
        ${cleanHouse},
        '{"vegOnly": false, "spicePreference": "medium"}'::jsonb,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    `;

    // Insert initial address
    const addressId = `addr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const combinedAddr = `${cleanHouse ? cleanHouse + ', ' : ''}${locality ? locality + ', ' : ''}${cleanIsland}, Lakshadweep`;
    await sql`
      INSERT INTO customer_addresses (
        id, customer_id, label, full_name, phone, island, house_name, locality, landmark, address, is_default
      ) VALUES (
        ${addressId},
        ${customerId},
        'Home',
        ${name.trim()},
        ${cleanPhone},
        ${cleanIsland},
        ${cleanHouse},
        ${locality || 'Main Locality'},
        ${landmark || ''},
        ${combinedAddr},
        true
      );
    `;

    // Create session token
    const token = `cs_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await sql`
      INSERT INTO customer_sessions (id, customer_id, token, expires_at)
      VALUES (${`sess_${customerId}`}, ${customerId}, ${token}, ${expiresAt.toISOString()})
      ON CONFLICT (id) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at;
    `;

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully',
      token,
      customer: {
        id: customerId,
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        island: cleanIsland,
        houseName: cleanHouse,
        locality: locality || '',
        landmark: landmark || '',
      },
    });
  } catch (error: any) {
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.', details: error.message },
      { status: 500 }
    );
  }
}
