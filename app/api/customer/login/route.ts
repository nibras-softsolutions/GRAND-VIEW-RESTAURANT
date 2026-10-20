import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || !emailOrPhone.trim()) {
      return NextResponse.json({ error: 'Please enter your phone number or email.' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Please enter your password.' }, { status: 400 });
    }

    const query = emailOrPhone.trim();
    const sql = getDb();

    // Look up customer by phone or email
    const rows = await sql`
      SELECT c.*, a.house_name, a.locality, a.landmark, a.address
      FROM customers c
      LEFT JOIN customer_addresses a ON a.customer_id = c.id AND a.is_default = true
      WHERE c.phone = ${query} 
         OR c.phone = ${`+91 ${query}`}
         OR c.email = ${query.toLowerCase()}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this phone number or email. Please register.' },
        { status: 404 }
      );
    }

    const customer = rows[0];

    // Check password if password_hash exists
    if (customer.password_hash) {
      const isMatch = await bcrypt.compare(password, customer.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }
    } else {
      // Legacy user without hash: set password_hash now
      const newHash = await bcrypt.hash(password, 10);
      await sql`
        UPDATE customers SET password_hash = ${newHash} WHERE id = ${customer.id};
      `;
    }

    // Create session token
    const token = `cs_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await sql`
      INSERT INTO customer_sessions (id, customer_id, token, expires_at)
      VALUES (${`sess_${customer.id}`}, ${customer.id}, ${token}, ${expiresAt.toISOString()})
      ON CONFLICT (id) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at;
    `;

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        island: customer.island || 'Amini',
        houseName: customer.house_name || '',
        locality: customer.locality || '',
        landmark: customer.landmark || '',
      },
    });
  } catch (error: any) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please check your network and try again.', details: error.message },
      { status: 500 }
    );
  }
}
