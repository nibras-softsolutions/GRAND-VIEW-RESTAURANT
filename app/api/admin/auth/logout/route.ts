import { NextResponse } from 'next/server';
import { getAdminSession, destroyAdminSession, logAdminAction } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getAdminSession();
    if (session) {
      await logAdminAction(
        session.user.id,
        session.user.name,
        'LOGOUT',
        'auth',
        session.user.id
      );
    }
    await destroyAdminSession();
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to process logout.' },
      { status: 500 }
    );
  }
}
