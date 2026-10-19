import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { CustomerProfile } from '@/types';

export async function GET() {
  try {
    const sql = getDb();
    const customerRows = await sql`
      SELECT * FROM customers 
      ORDER BY updated_at DESC 
      LIMIT 1;
    `;

    if (customerRows.length === 0) {
      return NextResponse.json({
        profile: {
          name: 'Alexander Wright',
          phone: '+91 98765 43210',
          email: 'alex.wright@example.com',
          preferences: { vegOnly: false, spicePreference: 'medium' },
          savedAddresses: [
            {
              id: 'addr_1',
              label: 'Home',
              address: 'Flat 4B, Marine View Heights, Waterfront Promenade, Kochi',
              landmark: 'Near Waterfront Light House',
              isDefault: true,
            },
            {
              id: 'addr_2',
              label: 'Work',
              address: 'Unit 301, Infopark Tower, Kakkanad, Kochi',
              landmark: 'Opposite Main Tech Hub Gate',
              isDefault: false,
            },
          ],
        },
      });
    }

    const customer = customerRows[0];
    const addresses = await sql`
      SELECT id, label, address, landmark, is_default as "isDefault" 
      FROM customer_addresses 
      WHERE customer_id = ${customer.id} 
      ORDER BY created_at ASC;
    `;

    const preferences = typeof customer.preferences === 'string' 
      ? JSON.parse(customer.preferences) 
      : customer.preferences || { vegOnly: false, spicePreference: 'medium' };

    return NextResponse.json({
      profile: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        preferences,
        savedAddresses: addresses,
      },
    });
  } catch (error) {
    console.error('Failed to fetch customer profile from Neon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer profile', details: error instanceof Error ? error.message : 'DB error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CustomerProfile = await request.json();
    const sql = getDb();
    const customerId = 'cust_default';

    await sql`
      INSERT INTO customers (id, name, phone, email, preferences, updated_at)
      VALUES (
        ${customerId},
        ${body.name},
        ${body.phone},
        ${body.email},
        ${JSON.stringify(body.preferences)}::jsonb,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        preferences = EXCLUDED.preferences,
        updated_at = CURRENT_TIMESTAMP;
    `;

    if (body.savedAddresses && body.savedAddresses.length > 0) {
      // Clear and re-insert addresses
      await sql`DELETE FROM customer_addresses WHERE customer_id = ${customerId};`;
      for (const addr of body.savedAddresses) {
        await sql`
          INSERT INTO customer_addresses (id, customer_id, label, address, landmark, is_default)
          VALUES (
            ${addr.id || `addr_${Date.now()}`},
            ${customerId},
            ${addr.label},
            ${addr.address},
            ${addr.landmark || ''},
            ${addr.isDefault || false}
          );
        `;
      }
    }

    return NextResponse.json({ success: true, message: 'Profile saved to Neon DB' });
  } catch (error) {
    console.error('Failed to save profile to Neon:', error);
    return NextResponse.json(
      { error: 'Failed to save customer profile', details: error instanceof Error ? error.message : 'DB error' },
      { status: 500 }
    );
  }
}
