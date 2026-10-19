'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'super_admin' | 'manager' | 'staff';
  } | null;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on login page, don't show admin chrome
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#1D1B18] text-white">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#1A1814] flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
