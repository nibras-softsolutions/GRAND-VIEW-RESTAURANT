import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT key, value FROM restaurant_settings;
    `;

    const settingsMap: Record<string, any> = {};
    for (const r of rows) {
      settingsMap[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
    }

    return NextResponse.json({
      settings: settingsMap,
      general: settingsMap.general || {
        name: 'Alfiya Kitchen',
        tagline: 'Good Food. Great Moments.',
        isOpen: true,
        phone: '+91 98765 43210',
        address: 'Marine Promenade, Waterfront Road, Kochi',
        openHours: '11:00 AM – 11:30 PM',
      },
      ordering: settingsMap.ordering || {
        deliveryEnabled: true,
        pickupEnabled: true,
        standardDeliveryFee: 40,
        freeDeliveryThreshold: 500,
        minimumOrderAmount: 150,
        deliveryTimeEstimate: '30–35 mins',
        pickupTimeEstimate: '15–20 mins',
        taxRatePercent: 5,
      },
    });
  } catch (error) {
    console.error('Failed to load settings from Neon:', error);
    return NextResponse.json(
      { error: 'Failed to load restaurant settings' },
      { status: 500 }
    );
  }
}
