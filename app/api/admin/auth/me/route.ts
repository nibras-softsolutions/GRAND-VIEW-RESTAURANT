import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized: Session missing or expired.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: session.user,
    sessionId: session.sessionId,
    expiresAt: session.expiresAt,
  });
}
