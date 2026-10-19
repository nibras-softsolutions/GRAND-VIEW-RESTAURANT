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
    const categories = await sql`
      SELECT c.*, COUNT(m.id) as item_count
      FROM categories c
      LEFT JOIN menu_items m ON c.id = m.category_id AND m.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.display_order ASC;
    `;

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'staff') {
      return NextResponse.json({ error: 'Forbidden: Staff cannot manage categories' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon, display_order } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const id = name.trim();
    const sql = getDb();

    await sql`
      INSERT INTO categories (id, name, description, icon, display_order, active)
      VALUES (
        ${id},
        ${name.trim()},
        ${description || ''},
        ${icon || 'UtensilsCrossed'},
        ${Number(display_order) || 0},
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        active = true,
        updated_at = CURRENT_TIMESTAMP;
    `;

    await logAdminAction(
      session.user.id,
      session.user.name,
      'CREATE_CATEGORY',
      'category',
      id,
      { name }
    );

    return NextResponse.json({ success: true, message: 'Category created successfully' });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'staff') {
      return NextResponse.json({ error: 'Forbidden: Staff cannot manage categories' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, icon, display_order, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      UPDATE categories
      SET 
        name = ${name || id},
        description = ${description || ''},
        icon = ${icon || 'UtensilsCrossed'},
        display_order = ${Number(display_order) || 0},
        active = ${active !== undefined ? Boolean(active) : true},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id};
    `;

    await logAdminAction(
      session.user.id,
      session.user.name,
      'UPDATE_CATEGORY',
      'category',
      id,
      { active }
    );

    return NextResponse.json({ success: true, message: 'Category updated' });
  } catch (error) {
    console.error('Categories PUT error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}
