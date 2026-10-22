'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bike, Package, CheckCircle2, User, LogOut } from 'lucide-react';
import { DeliveryPersonUser } from '@/lib/auth';

interface DeliveryLayoutClientProps {
  children: React.ReactNode;
  deliveryPerson: DeliveryPersonUser | null;
}

export default function DeliveryLayoutClient({
  children,
  deliveryPerson,
}: DeliveryLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, render children directly
  if (pathname === '/delivery/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/delivery/auth/logout', { method: 'POST' });
      router.push('/delivery/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col text-[#1A1814]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#1D1B18] text-white px-4 py-3 sm:px-6 shadow-md border-b border-[#C99A4A]/20">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/delivery" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C99A4A]/20 border border-[#C99A4A]/40 flex items-center justify-center text-[#C99A4A]">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold text-white tracking-wide">
                Alfiya Kitchen Deliveries
              </p>
              <p className="text-[10px] text-[#A0988C]">
                {deliveryPerson?.name || 'Delivery Partner'} {deliveryPerson?.vehicleInfo ? `• ${deliveryPerson.vehicleInfo}` : ''}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/delivery/profile"
              className="p-1.5 rounded-lg text-[#D1C9BE] hover:text-white hover:bg-white/10 transition-colors"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-4 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E6E1D5] px-4 py-2 shadow-lg">
        <div className="max-w-xl mx-auto grid grid-cols-3 gap-1">
          <Link
            href="/delivery"
            className={`flex flex-col items-center py-1.5 rounded-xl transition-colors ${
              pathname === '/delivery'
                ? 'text-[#C99A4A] font-bold'
                : 'text-[#77736C] hover:text-[#1A1814]'
            }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Assigned</span>
          </Link>

          <Link
            href="/delivery/orders?filter=completed"
            className={`flex flex-col items-center py-1.5 rounded-xl transition-colors ${
              pathname.includes('completed')
                ? 'text-[#C99A4A] font-bold'
                : 'text-[#77736C] hover:text-[#1A1814]'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Delivered</span>
          </Link>

          <Link
            href="/delivery/profile"
            className={`flex flex-col items-center py-1.5 rounded-xl transition-colors ${
              pathname === '/delivery/profile'
                ? 'text-[#C99A4A] font-bold'
                : 'text-[#77736C] hover:text-[#1A1814]'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
