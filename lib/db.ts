import { neon } from '@neondatabase/serverless';

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

  // 3. Saved Delivery Addresses table
  await sql`
    CREATE TABLE IF NOT EXISTS customer_addresses (
      id VARCHAR(60) PRIMARY KEY,
      customer_id VARCHAR(60),
      label VARCHAR(50) NOT NULL DEFAULT 'Home',
      address TEXT NOT NULL,
      landmark VARCHAR(200),
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  return { success: true, message: 'Database tables initialized successfully.' };
}
