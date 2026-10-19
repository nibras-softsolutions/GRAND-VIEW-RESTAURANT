import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getAdminSession, logAdminAction } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const sql = getDb();
    const rows = await sql`
      SELECT id, name, email, role, active, last_login_at, created_at 
      FROM admin_users 
      ORDER BY created_at ASC;
    `;

    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const sql = getDb();

    // Check if email already exists
    const existing = await sql`SELECT id FROM admin_users WHERE LOWER(email) = ${cleanEmail};`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An admin with this email already exists.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `admin_${Date.now().toString().slice(-6)}`;

    await sql`
      INSERT INTO admin_users (id, name, email, password_hash, role, active)
      VALUES (${userId}, ${name.trim()}, ${cleanEmail}, ${passwordHash}, ${role}, true);
    `;

    await logAdminAction(
      session.user.id,
      session.user.name,
      'CREATE_ADMIN_USER',
      'admin_user',
      userId,
      { email: cleanEmail, role }
    );

    return NextResponse.json({ success: true, message: 'Admin user created successfully.' });
  } catch (error) {
    console.error('Admin users POST error:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, active, role } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Protect against self-deactivation of super_admin
    if (id === session.user.id && active === false) {
      return NextResponse.json({ error: 'You cannot deactivate your own account.' }, { status: 400 });
    }

    const sql = getDb();
    if (active !== undefined) {
      await sql`
        UPDATE admin_users 
        SET active = ${Boolean(active)}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
    }

    if (role) {
      await sql`
        UPDATE admin_users 
        SET role = ${role}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
    }

    await logAdminAction(
      session.user.id,
      session.user.name,
      'UPDATE_ADMIN_STATUS',
      'admin_user',
      id,
      { active, role }
    );

    return NextResponse.json({ success: true, message: 'Admin user updated.' });
  } catch (error) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update admin user' }, { status: 500 });
  }
}
