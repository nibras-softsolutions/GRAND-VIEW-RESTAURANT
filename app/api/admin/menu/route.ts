import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminSession, logAdminAction } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const sql = getDb();
    let rows;

    if (category && category !== 'All') {
      rows = await sql`
        SELECT m.*, c.name as category_name
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        WHERE m.deleted_at IS NULL AND m.category_id = ${category}
        ORDER BY m.created_at DESC;
      `;
    } else {
      rows = await sql`
        SELECT m.*, c.name as category_name
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        WHERE m.deleted_at IS NULL
        ORDER BY m.created_at DESC;
      `;
    }

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error('Admin menu GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Staff cannot create menu items
    if (session.user.role === 'staff') {
      return NextResponse.json({ error: 'Forbidden: Staff cannot create menu items' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      category_id,
      description,
      price,
      discount_price,
      image,
      is_veg,
      spicy_level,
      prep_time,
      calories,
      portion_size,
      popular,
      featured,
      available,
      dietary_tags,
      chef_notes,
      add_ons,
    } = body;

    // Server-side validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Dish name is required.' }, { status: 400 });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ error: 'Valid positive price is required.' }, { status: 400 });
    }

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
    }

    // Generate unique slug-like ID: e.g. paneer-tikka-1729
    const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const sql = getDb();
    await sql`
      INSERT INTO menu_items (
        id,
        name,
        category_id,
        description,
        price,
        discount_price,
        image,
        is_veg,
        spicy_level,
        prep_time,
        calories,
        portion_size,
        popular,
        featured,
        available,
        dietary_tags,
        chef_notes,
        add_ons
      ) VALUES (
        ${id},
        ${name.trim()},
        ${category_id || 'Main Course'},
        ${description || ''},
        ${numPrice},
        ${discount_price ? Number(discount_price) : null},
        ${image.trim()},
        ${Boolean(is_veg)},
        ${Number(spicy_level) || 0},
        ${prep_time || '20 mins'},
        ${calories ? Number(calories) : null},
        ${portion_size || 'Standard'},
        ${Boolean(popular)},
        ${Boolean(featured)},
        ${available !== false},
        ${JSON.stringify(dietary_tags || [])}::jsonb,
        ${chef_notes || ''},
        ${JSON.stringify(add_ons || [])}::jsonb
      );
    `;

    // Audit log
    await logAdminAction(
      session.user.id,
      session.user.name,
      'CREATE_MENU_ITEM',
      'menu_item',
      id,
      { name: name.trim(), price: numPrice }
    );

    return NextResponse.json({ success: true, id, message: 'Menu item created successfully.' });
  } catch (error) {
    console.error('Admin menu POST error:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
