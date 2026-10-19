import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getAdminSession, logAdminAction } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT id, name, email, role, last_login_at, created_at 
    FROM admin_users 
    WHERE id = ${session.user.id} 
    LIMIT 1;
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ profile: rows[0] });
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;
    const sql = getDb();

    // Verify current user
    const rows = await sql`
      SELECT id, name, email, password_hash 
      FROM admin_users 
      WHERE id = ${session.user.id} 
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = rows[0];

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters long.' }, { status: 400 });
      }

      const isCurrentMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentMatch) {
        return NextResponse.json({ error: 'Current password does not match.' }, { status: 400 });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await sql`
        UPDATE admin_users 
        SET 
          password_hash = ${newHash},
          name = ${name || user.name},
          email = ${email ? email.trim().toLowerCase() : user.email},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${session.user.id};
      `;

      await logAdminAction(
        session.user.id,
        session.user.name,
        'CHANGE_PASSWORD',
        'admin_user',
        session.user.id
      );

      return NextResponse.json({ success: true, message: 'Profile and password updated successfully.' });
    }

    // Only updating name/email
    await sql`
      UPDATE admin_users 
      SET 
        name = ${name || user.name},
        email = ${email ? email.trim().toLowerCase() : user.email},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${session.user.id};
    `;

    await logAdminAction(
      session.user.id,
      session.user.name,
      'UPDATE_PROFILE',
      'admin_user',
      session.user.id
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
