import { NextResponse } from 'next/server';
import { getDeliverySession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getDeliverySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      deliveryPerson: session.deliveryPerson,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Delivery me error:', error);
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 });
  }
}
