import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { createAdminSession, logAdminAction } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validation
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const sql = getDb();

    // 2. Query user
    const rows = await sql`
      SELECT id, name, email, password_hash, role, active 
      FROM admin_users 
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      // Use constant-time dummy compare to mitigate timing attacks
      await bcrypt.compare(password, '$2a$10$wKzN1mR7uK5K5K5K5K5K5.K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K');
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = rows[0];

    // 3. Check if account is active
    if (!user.active) {
      return NextResponse.json(
        { error: 'Account has been deactivated. Please contact Super Admin.' },
        { status: 403 }
      );
    }

    // 4. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 5. Create secure session
    const ip = request.headers.get('x-forwarded-for') || 'local';
    const userAgent = request.headers.get('user-agent') || '';

    await createAdminSession(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: Boolean(user.active),
      },
      ip,
      userAgent
    );

    // 6. Audit log
    await logAdminAction(user.id, user.name, 'LOGIN_SUCCESS', 'auth', user.id, { ip });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
