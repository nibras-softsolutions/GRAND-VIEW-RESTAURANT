import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

export const ADMIN_COOKIE_NAME = 'gv_admin_session';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'staff';
  active: boolean;
}

export interface AdminSession {
  user: AdminUser;
  sessionId: string;
  expiresAt: string;
}

/**
 * Creates an authenticated session for an admin user and sets an HttpOnly cookie
 */
export async function createAdminSession(
  user: AdminUser,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const sql = getDb();
  const sessionId = `sess_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Record session in Neon database
  await sql`
    INSERT INTO admin_sessions (id, user_id, role, ip_address, user_agent, expires_at)
    VALUES (${sessionId}, ${user.id}, ${user.role}, ${ipAddress || null}, ${userAgent || null}, ${expiresAt.toISOString()});
  `;

  // Update last login timestamp
  await sql`
    UPDATE admin_users 
    SET last_login_at = CURRENT_TIMESTAMP 
    WHERE id = ${user.id};
  `;

  // Set secure HttpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  });

  return sessionId;
}

/**
 * Retrieves and validates the current admin session from HttpOnly cookie
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const sessionId = sessionCookie.value;
    const sql = getDb();

    // Query active session joined with active admin user
    const rows = await sql`
      SELECT 
        s.id as session_id,
        s.expires_at,
        u.id as user_id,
        u.name,
        u.email,
        u.role,
        u.active
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.id = ${sessionId} 
        AND s.expires_at > CURRENT_TIMESTAMP
        AND u.active = true
      LIMIT 1;
    `;

    if (rows.length === 0) {
      // Invalid or expired session
      return null;
    }

    const row = rows[0];
    return {
      user: {
        id: row.user_id,
        name: row.name,
        email: row.email,
        role: row.role as 'super_admin' | 'manager' | 'staff',
        active: Boolean(row.active),
      },
      sessionId: row.session_id,
      expiresAt: row.expires_at,
    };
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    console.error('Error verifying admin session:', err);
    return null;
  }
}

/**
 * Destroys the current admin session
 */
export async function destroyAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

    if (sessionCookie?.value) {
      const sql = getDb();
      await sql`
        DELETE FROM admin_sessions 
        WHERE id = ${sessionCookie.value};
      `;
    }

    cookieStore.delete(ADMIN_COOKIE_NAME);
  } catch (err) {
    console.error('Error destroying admin session:', err);
  }
}

/**
 * Records an entry in the admin audit log
 */
export async function logAdminAction(
  adminId: string,
  adminName: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: any
) {
  try {
    const sql = getDb();
    const logId = `log_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    await sql`
      INSERT INTO admin_audit_logs (id, admin_id, admin_name, action, entity_type, entity_id, details)
      VALUES (
        ${logId},
        ${adminId},
        ${adminName},
        ${action},
        ${entityType},
        ${entityId || null},
        ${details ? JSON.stringify(details) : null}::jsonb
      );
    `;
  } catch (err) {
    console.error('Failed to write admin audit log:', err);
  }
}
