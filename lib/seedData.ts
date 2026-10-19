import { getDb } from '@/lib/db';
import { MENU_ITEMS, CATEGORIES, RESTAURANT_INFO } from '@/data/menuData';
import bcrypt from 'bcryptjs';

export async function seedDatabaseIfEmpty() {
  const sql = getDb();

  // 1. Check if admin exists, if not seed admins
  const adminCount = await sql`SELECT count(*) as count FROM admin_users;`;
  if (Number(adminCount[0]?.count) === 0) {
    const superAdminHash = bcrypt.hashSync('GrandView@2026', 10);
    const managerHash = bcrypt.hashSync('Manager@2026', 10);
    const staffHash = bcrypt.hashSync('Staff@2026', 10);

    await sql`
      INSERT INTO admin_users (id, name, email, password_hash, role, active)
      VALUES 
        ('admin_super', 'Alexander Wright', 'admin@grandview.com', ${superAdminHash}, 'super_admin', true),
        ('admin_manager', 'Meera Krishnan', 'manager@grandview.com', ${managerHash}, 'manager', true),
        ('admin_staff', 'Rahul Verma', 'staff@grandview.com', ${staffHash}, 'staff', true)
      ON CONFLICT (email) DO NOTHING;
    `;
  }

  // 2. Seed categories if empty
  const catCount = await sql`SELECT count(*) as count FROM categories;`;
  if (Number(catCount[0]?.count) === 0) {
    for (let i = 0; i < CATEGORIES.length; i++) {
      const c = CATEGORIES[i];
      if (c.id === 'All') continue;
      await sql`
        INSERT INTO categories (id, name, description, icon, display_order, active)
        VALUES (${c.id}, ${c.label}, ${c.label}, ${c.icon || 'UtensilsCrossed'}, ${i + 1}, true)
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  }

  // 3. Seed restaurant settings if empty
  const settingsCount = await sql`SELECT count(*) as count FROM restaurant_settings;`;
  if (Number(settingsCount[0]?.count) === 0) {
    const settings = {
      general: {
        name: RESTAURANT_INFO.name,
        tagline: RESTAURANT_INFO.tagline,
        phone: RESTAURANT_INFO.phone,
        email: RESTAURANT_INFO.email,
        address: RESTAURANT_INFO.address,
        openHours: RESTAURANT_INFO.openingHours,
        isOpen: true,
        closureNotice: 'We are currently closed for kitchen sanitation. We will accept orders again at 11:00 AM.',
      },
      ordering: {
        deliveryEnabled: true,
        pickupEnabled: true,
        standardDeliveryFee: RESTAURANT_INFO.deliveryFee,
        freeDeliveryThreshold: RESTAURANT_INFO.freeDeliveryThreshold,
        minimumOrderAmount: 150,
        deliveryTimeEstimate: RESTAURANT_INFO.deliveryTime,
        pickupTimeEstimate: RESTAURANT_INFO.pickupTime,
        taxRatePercent: 5,
      },
    };

    for (const [key, value] of Object.entries(settings)) {
      await sql`
        INSERT INTO restaurant_settings (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO NOTHING;
      `;
    }
  }

  // 4. Seed menu items if empty
  const menuCount = await sql`SELECT count(*) as count FROM menu_items WHERE deleted_at IS NULL;`;
  if (Number(menuCount[0]?.count) === 0) {
    for (const item of MENU_ITEMS) {
      const addonsJson = JSON.stringify(item.addOns || []);
      const tagsJson = JSON.stringify(item.dietaryTags || []);

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
          ${item.id},
          ${item.name},
          ${item.category},
          ${item.description},
          ${item.price},
          ${null},
          ${item.image},
          ${Boolean(item.isVeg)},
          ${item.spicyLevel || 0},
          ${item.prepTime || '20 mins'},
          ${item.calories || null},
          ${item.portionSize || 'Standard'},
          ${Boolean(item.popular)},
          ${Boolean(item.chefPick)},
          ${true},
          ${tagsJson}::jsonb,
          ${item.chefNotes || ''},
          ${addonsJson}::jsonb
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  }

  return { success: true, message: 'Database initialized and seeded.' };
}
