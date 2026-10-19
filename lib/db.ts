import { neon } from '@neondatabase/serverless';
import { seedDatabaseIfEmpty } from './seedData';

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }
  return neon(databaseUrl);
}

/**
 * Ensures required database tables exist in Neon Postgres
 */
export async function initDatabase() {
  const sql = getDb();

  // 1. Orders table
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(60) PRIMARY KEY,
      order_type VARCHAR(20) NOT NULL DEFAULT 'delivery',
      status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
      customer_name VARCHAR(120) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      email VARCHAR(120),
      delivery_address TEXT,
      landmark VARCHAR(200),
      delivery_notes TEXT,
      payment_method VARCHAR(50) NOT NULL,
      payment_sub_option VARCHAR(30),
      subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
      delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
      tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
      total NUMERIC(10, 2) NOT NULL,
      estimated_time VARCHAR(50),
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 2. Customers / Profile table
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(60) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      email VARCHAR(120),
      preferences JSONB DEFAULT '{"vegOnly": false, "spicePreference": "medium"}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 3. Saved Delivery Addresses table (Structured for local Lakshadweep addresses)
  await sql`
    CREATE TABLE IF NOT EXISTS customer_addresses (
      id VARCHAR(60) PRIMARY KEY,
      customer_id VARCHAR(60),
      label VARCHAR(50) NOT NULL DEFAULT 'Home',
      full_name VARCHAR(120),
      phone VARCHAR(40),
      island VARCHAR(60) NOT NULL DEFAULT 'Amini',
      house_name VARCHAR(150) NOT NULL DEFAULT '',
      locality VARCHAR(150) NOT NULL DEFAULT '',
      landmark VARCHAR(200),
      delivery_instructions TEXT,
      address TEXT NOT NULL,
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 3.1 Delivery Persons table
  await sql`
    CREATE TABLE IF NOT EXISTS delivery_persons (
      id VARCHAR(60) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      phone VARCHAR(40) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      vehicle_info VARCHAR(100),
      active BOOLEAN DEFAULT true,
      last_login_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 3.2 Delivery Sessions table
  await sql`
    CREATE TABLE IF NOT EXISTS delivery_sessions (
      id VARCHAR(100) PRIMARY KEY,
      delivery_person_id VARCHAR(60) NOT NULL REFERENCES delivery_persons(id) ON DELETE CASCADE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 3.3 Order Status History table
  await sql`
    CREATE TABLE IF NOT EXISTS order_status_history (
      id VARCHAR(80) PRIMARY KEY,
      order_id VARCHAR(60) NOT NULL,
      status VARCHAR(40) NOT NULL,
      actor_role VARCHAR(30) NOT NULL,
      actor_name VARCHAR(120),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 4. Admin Users table
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(60) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(120) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'staff',
      active BOOLEAN DEFAULT true,
      last_login_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 5. Admin Sessions table (HttpOnly cookie session management)
  await sql`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id VARCHAR(100) PRIMARY KEY,
      user_id VARCHAR(60) NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      role VARCHAR(30) NOT NULL,
      ip_address VARCHAR(60),
      user_agent TEXT,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 6. Categories table
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(60) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      icon VARCHAR(50) DEFAULT 'UtensilsCrossed',
      display_order INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 7. Menu Items table (Soft deletable)
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id VARCHAR(80) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category_id VARCHAR(60) NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL,
      discount_price NUMERIC(10, 2),
      image TEXT NOT NULL,
      is_veg BOOLEAN DEFAULT false,
      spicy_level INTEGER DEFAULT 0,
      prep_time VARCHAR(30) DEFAULT '20 mins',
      calories INTEGER,
      portion_size VARCHAR(50),
      popular BOOLEAN DEFAULT false,
      featured BOOLEAN DEFAULT false,
      available BOOLEAN DEFAULT true,
      dietary_tags JSONB DEFAULT '[]'::jsonb,
      chef_notes TEXT,
      add_ons JSONB DEFAULT '[]'::jsonb,
      deleted_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 8. Restaurant Settings table
  await sql`
    CREATE TABLE IF NOT EXISTS restaurant_settings (
      key VARCHAR(60) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 9. Admin Audit Logs table
  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id VARCHAR(80) PRIMARY KEY,
      admin_id VARCHAR(60) NOT NULL,
      admin_name VARCHAR(120) NOT NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(80),
      details JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Seed default items if empty
  await seedDatabaseIfEmpty();

  return { success: true, message: 'Database tables initialized and seeded successfully.' };
}
