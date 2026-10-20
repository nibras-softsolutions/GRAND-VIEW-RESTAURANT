import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const sql = getDb();
    const sessions = await sql`
      SELECT s.*, c.name, c.phone, c.email, c.island, c.house_name
      FROM customer_sessions s
      JOIN customers c ON c.id = s.customer_id
      WHERE s.token = ${token} AND s.expires_at > CURRENT_TIMESTAMP
      LIMIT 1;
    `;

    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    const user = sessions[0];
    const addresses = await sql`
      SELECT * FROM customer_addresses WHERE customer_id = ${user.customer_id} ORDER BY is_default DESC;
    `;

    return NextResponse.json({
      success: true,
      customer: {
        id: user.customer_id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        island: user.island,
        houseName: user.house_name,
        addresses,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve user', details: err.message }, { status: 500 });
  }
}
