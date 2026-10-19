import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const result = await sql`
      SELECT current_database() as database, current_user as user, version() as version;
    `;
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    return NextResponse.json({
      status: 'healthy',
      connected: true,
      database: result[0]?.database,
      user: result[0]?.user,
      tables: tables.map((t) => t.table_name),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 500 }
    );
  }
}
