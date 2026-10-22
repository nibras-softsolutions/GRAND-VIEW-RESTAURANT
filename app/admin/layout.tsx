import React from 'react';
import type { Metadata } from 'next';
import { getAdminSession } from '@/lib/auth';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Alfiya Kitchen — Management Portal',
  description: 'Secure, dynamic restaurant management console for Alfiya Kitchen.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <AdminLayoutClient user={session?.user || null}>
      {children}
    </AdminLayoutClient>
  );
}
