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
          name: 'Mohammed Shafi',
          phone: '+91 94473 45678',
          email: 'shafi.amini@example.com',
          preferences: { vegOnly: false, spicePreference: 'medium' },
          savedAddresses: [
            {
              id: 'addr_amini_1',
              label: 'Home',
              fullName: 'Mohammed Shafi',
              phone: '+91 94473 45678',
              island: 'Amini',
              houseName: 'Kunnumpuram House',
              locality: 'Near Old Juma Masjid',
              landmark: 'Opposite BSNL Tower',
              deliveryInstructions: 'Please call when you reach nearby.',
              address: 'Kunnumpuram House, Near Old Juma Masjid, Amini, Lakshadweep',
              isDefault: true,
            },
          ],
        },
      });
    }

    const customer = customerRows[0];
    const addresses = await sql`
      SELECT 
        id, label, full_name as "fullName", phone,
        island, house_name as "houseName", locality, landmark,
        delivery_instructions as "deliveryInstructions",
        address, is_default as "isDefault" 
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
        savedAddresses: addresses.map((a: any) => ({
          id: a.id,
          label: a.label || 'Home',
          fullName: a.fullName || customer.name,
          phone: a.phone || customer.phone,
          island: a.island || 'Amini',
          houseName: a.houseName || '',
          locality: a.locality || '',
          landmark: a.landmark || '',
          deliveryInstructions: a.deliveryInstructions || '',
          address: a.address || `${a.houseName || ''}, ${a.locality || ''}, ${a.island || 'Amini'}`,
          isDefault: Boolean(a.isDefault),
        })),
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
      await sql`DELETE FROM customer_addresses WHERE customer_id = ${customerId};`;
      for (const addr of body.savedAddresses) {
        const fullAddrStr = addr.address || `${addr.houseName || ''}, ${addr.locality || ''}, ${addr.island || 'Amini'}`;

        await sql`
          INSERT INTO customer_addresses (
            id, customer_id, label, full_name, phone, island, house_name, locality, landmark, delivery_instructions, address, is_default
          ) VALUES (
            ${addr.id || `addr_${Date.now()}_${Math.random().toString(36).substring(7)}`},
            ${customerId},
            ${addr.label || 'Home'},
            ${addr.fullName || body.name},
            ${addr.phone || body.phone},
            ${addr.island || 'Amini'},
            ${addr.houseName || ''},
            ${addr.locality || ''},
            ${addr.landmark || ''},
            ${addr.deliveryInstructions || ''},
            ${fullAddrStr},
            ${Boolean(addr.isDefault)}
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
