import React from 'react';
import type { Metadata } from 'next';
import { getDeliverySession } from '@/lib/auth';
import DeliveryLayoutClient from '@/components/delivery/DeliveryLayoutClient';

export const metadata: Metadata = {
  title: 'Grand View Restaurant — Delivery Partner Portal',
  description: 'Mobile delivery console for Grand View Restaurant delivery partners in Lakshadweep.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DeliveryRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getDeliverySession();

  return (
    <DeliveryLayoutClient deliveryPerson={session?.deliveryPerson || null}>
      {children}
    </DeliveryLayoutClient>
  );
}
