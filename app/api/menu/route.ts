import { NextResponse } from 'next/server';
import { getDb, initDatabase } from '@/lib/db';
import { FoodItem, Category } from '@/types';

// Map database row to customer FoodItem
function mapRowToFoodItem(row: any): FoodItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category_id as Category,
    description: row.description || '',
    price: Number(row.price),
    rating: 4.8,
    reviews: 120,
    image: row.image,
    popular: Boolean(row.popular),
    chefPick: Boolean(row.featured),
    isVeg: Boolean(row.is_veg),
    spicyLevel: row.spicy_level ?? 0,
    prepTime: row.prep_time || '20 mins',
    calories: row.calories ? Number(row.calories) : undefined,
    portionSize: row.portion_size || 'Standard',
    dietaryTags: typeof row.dietary_tags === 'string' ? JSON.parse(row.dietary_tags) : row.dietary_tags || [],
    chefNotes: row.chef_notes || '',
    addOns: typeof row.add_ons === 'string' ? JSON.parse(row.add_ons) : row.add_ons || [],
  };
}

export async function GET() {
  try {
    const sql = getDb();

    // Query active categories ordered by display_order
    const categoriesRows = await sql`
      SELECT id, name, description, icon, display_order 
      FROM categories 
      WHERE active = true 
      ORDER BY display_order ASC;
    `;

    // Query available menu items that are not deleted
    const itemsRows = await sql`
      SELECT * 
      FROM menu_items 
      WHERE deleted_at IS NULL AND available = true 
      ORDER BY created_at ASC;
    `;

    // If database was empty for some reason, ensure tables and seed
    if (itemsRows.length === 0) {
      await initDatabase();
      const refetched = await sql`
        SELECT * FROM menu_items WHERE deleted_at IS NULL AND available = true ORDER BY created_at ASC;
      `;
      const categoriesRefetched = await sql`
        SELECT id, name, description, icon, display_order FROM categories WHERE active = true ORDER BY display_order ASC;
      `;
      return NextResponse.json({
        categories: categoriesRefetched,
        dishes: refetched.map(mapRowToFoodItem),
      });
    }

    const dishes = itemsRows.map(mapRowToFoodItem);

    return NextResponse.json({
      categories: categoriesRows,
      dishes,
    });
  } catch (error) {
    console.error('Failed to load menu from Neon:', error);
    return NextResponse.json(
      { error: 'Failed to load menu' },
      { status: 500 }
    );
  }
}
