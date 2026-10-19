import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ctbZrFCM7DW6@ep-quiet-thunder-b5n4vcxe-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(databaseUrl);

async function runMigration() {
  console.log('--- Migrating Database for 3-Role System & Lakshadweep Local Address ---');

  // 1. Delivery Persons Table
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
  console.log('✓ delivery_persons table verified');

  // 2. Delivery Sessions Table
  await sql`
    CREATE TABLE IF NOT EXISTS delivery_sessions (
      id VARCHAR(100) PRIMARY KEY,
      delivery_person_id VARCHAR(60) NOT NULL REFERENCES delivery_persons(id) ON DELETE CASCADE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ delivery_sessions table verified');

  // 3. Order Status History Table
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
  console.log('✓ order_status_history table verified');

  // 4. Update orders table with structured local address & delivery person assignment
  await sql`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS island VARCHAR(60),
    ADD COLUMN IF NOT EXISTS house_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS locality VARCHAR(150),
    ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
    ADD COLUMN IF NOT EXISTS delivery_person_id VARCHAR(60),
    ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(30) DEFAULT 'unassigned';
  `;
  console.log('✓ orders table columns updated');

  // 5. Update customer_addresses table with structured local address fields
  await sql`
    ALTER TABLE customer_addresses
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(40),
    ADD COLUMN IF NOT EXISTS island VARCHAR(60),
    ADD COLUMN IF NOT EXISTS house_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS locality VARCHAR(150),
    ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  `;
  console.log('✓ customer_addresses table columns updated');

  // 6. Seed default delivery persons if empty
  const count = await sql`SELECT count(*) as count FROM delivery_persons;`;
  if (Number(count[0]?.count) === 0) {
    const passwordHash = bcrypt.hashSync('Delivery@2026', 10);
    await sql`
      INSERT INTO delivery_persons (id, name, phone, password_hash, vehicle_info, active)
      VALUES 
        ('deliv_1', 'Rashid Ali', '+91 94471 23456', ${passwordHash}, 'Honda Activa (LD-01-A-1234)', true),
        ('deliv_2', 'Sayed Koya', '+91 94472 34567', ${passwordHash}, 'Hero Splendor (LD-01-B-5678)', true)
      ON CONFLICT (phone) DO NOTHING;
    `;
    console.log('✓ Seeded default delivery persons (Rashid Ali, Sayed Koya)');
  }

  // 7. Seed sample Lakshadweep customer address if none exists
  const addrCount = await sql`SELECT count(*) as count FROM customer_addresses;`;
  if (Number(addrCount[0]?.count) === 0) {
    await sql`
      INSERT INTO customer_addresses (
        id, customer_id, label, full_name, phone, island, house_name, locality, landmark, delivery_instructions, is_default, address
      ) VALUES (
        'addr_amini_1', 'cust_default', 'Home', 'Mohammed Shafi', '+91 94473 45678', 'Amini', 'Kunnumpuram House', 'Near Old Juma Masjid', 'Opposite BSNL Tower', 'Please call when you reach nearby.', true, 'Kunnumpuram House, Near Old Juma Masjid, Amini, Lakshadweep'
      );
    `;
    console.log('✓ Seeded sample Lakshadweep customer address');
  }

  console.log('=== Migration Complete ===');
}

runMigration().catch(console.error);
