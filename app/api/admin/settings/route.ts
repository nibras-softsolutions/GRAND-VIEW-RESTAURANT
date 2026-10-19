import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminSession, logAdminAction } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getDb();
    const rows = await sql`SELECT key, value FROM restaurant_settings;`;

    const settingsMap: Record<string, any> = {};
    for (const r of rows) {
      settingsMap[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
    }

    return NextResponse.json({
      general: settingsMap.general || {},
      ordering: settingsMap.ordering || {},
    });
  } catch (error) {
    console.error('Admin settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'staff') {
      return NextResponse.json({ error: 'Forbidden: Staff cannot modify restaurant settings' }, { status: 403 });
    }

    const body = await request.json();
    const { general, ordering } = body;
    const sql = getDb();

    if (general) {
      await sql`
        INSERT INTO restaurant_settings (key, value, updated_at)
        VALUES ('general', ${JSON.stringify(general)}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP;
      `;
    }

    if (ordering) {
      await sql`
        INSERT INTO restaurant_settings (key, value, updated_at)
        VALUES ('ordering', ${JSON.stringify(ordering)}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP;
      `;
    }

    await logAdminAction(
      session.user.id,
      session.user.name,
      'UPDATE_SETTINGS',
      'settings',
      'restaurant_settings',
      { general, ordering }
    );

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Admin settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
