import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminSession, logAdminAction } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const sql = getDb();

    const rows = await sql`
      SELECT * FROM menu_items 
      WHERE id = ${id} AND deleted_at IS NULL 
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ item: rows[0] });
  } catch (error) {
    console.error('Admin menu item GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch menu item' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'staff') {
      return NextResponse.json({ error: 'Forbidden: Staff cannot edit menu items' }, { status: 403 });
    }

    const { id } = await params;
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

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ error: 'Valid price is required.' }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      UPDATE menu_items 
      SET 
        name = ${name},
        category_id = ${category_id},
        description = ${description || ''},
        price = ${numPrice},
        discount_price = ${discount_price ? Number(discount_price) : null},
        image = ${image},
        is_veg = ${Boolean(is_veg)},
        spicy_level = ${Number(spicy_level) || 0},
        prep_time = ${prep_time || '20 mins'},
        calories = ${calories ? Number(calories) : null},
        portion_size = ${portion_size || 'Standard'},
        popular = ${Boolean(popular)},
        featured = ${Boolean(featured)},
        available = ${Boolean(available)},
        dietary_tags = ${JSON.stringify(dietary_tags || [])}::jsonb,
        chef_notes = ${chef_notes || ''},
        add_ons = ${JSON.stringify(add_ons || [])}::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND deleted_at IS NULL;
    `;

    await logAdminAction(
      session.user.id,
      session.user.name,
      'UPDATE_MENU_ITEM',
      'menu_item',
      id,
      { name, price: numPrice, available }
    );

    return NextResponse.json({ success: true, message: 'Menu item updated successfully.' });
  } catch (error) {
    console.error('Admin menu item PUT error:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const sql = getDb();

    // Partial updates like toggle availability or toggle popular
    if ('available' in body) {
      await sql`
        UPDATE menu_items 
        SET available = ${Boolean(body.available)}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id} AND deleted_at IS NULL;
      `;
      await logAdminAction(
        session.user.id,
        session.user.name,
        'TOGGLE_AVAILABILITY',
        'menu_item',
        id,
        { available: body.available }
      );
    }

    if ('popular' in body) {
      await sql`
        UPDATE menu_items 
        SET popular = ${Boolean(body.popular)}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id} AND deleted_at IS NULL;
      `;
    }

    if ('featured' in body) {
      await sql`
        UPDATE menu_items 
        SET featured = ${Boolean(body.featured)}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id} AND deleted_at IS NULL;
      `;
    }

    if ('price' in body && !isNaN(Number(body.price))) {
      const p = Number(body.price);
      await sql`
        UPDATE menu_items 
        SET price = ${p}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id} AND deleted_at IS NULL;
      `;
      await logAdminAction(
        session.user.id,
        session.user.name,
        'UPDATE_PRICE',
        'menu_item',
        id,
        { price: p }
      );
    }

    return NextResponse.json({ success: true, message: 'Updated successfully.' });
  } catch (error) {
    console.error('Admin menu item PATCH error:', error);
    return NextResponse.json({ error: 'Failed to patch menu item' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'staff') {
      return NextResponse.json({ error: 'Forbidden: Staff cannot delete menu items' }, { status: 403 });
    }

    const { id } = await params;
    const sql = getDb();

    // Soft deletion to protect historical orders!
    await sql`
      UPDATE menu_items 
      SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id};
    `;

    await logAdminAction(
      session.user.id,
      session.user.name,
      'SOFT_DELETE_MENU_ITEM',
      'menu_item',
      id
    );

    return NextResponse.json({ success: true, message: 'Menu item removed from active menu.' });
  } catch (error) {
    console.error('Admin menu item DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
