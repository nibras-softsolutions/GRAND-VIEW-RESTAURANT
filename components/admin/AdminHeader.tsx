'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu as MenuIcon,
  Bell,
  Plus,
  Power,
  Store,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick: () => void;
  user?: {
    name: string;
    role: string;
  } | null;
}

export default function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch live settings and active orders count
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.general?.isOpen !== undefined) {
          setIsOpen(Boolean(data.general.isOpen));
        }
      })
      .catch(() => {});

    fetch('/api/admin/orders?limit=20')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orders) {
          const active = data.orders.filter((o: any) =>
            ['confirmed', 'preparing', 'out_for_delivery', 'ready_for_pickup'].includes(o.status)
          );
          setActiveOrdersCount(active.length);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleToggleStoreStatus = async () => {
    try {
      setIsUpdatingStatus(true);
      const newStatus = !isOpen;
      setIsOpen(newStatus);

      // Fetch current settings to merge
      const settingsRes = await fetch('/api/admin/settings');
      const settingsData = await settingsRes.json();

      const updatedGeneral = {
        ...(settingsData.general || {}),
        isOpen: newStatus,
      };

      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ general: updatedGeneral }),
      });
    } catch (err) {
      console.error('Failed to toggle restaurant status', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getPageTitle = (path: string) => {
    if (path === '/admin') return 'Dashboard Overview';
    if (path.startsWith('/admin/orders')) return 'Order Operations';
    if (path === '/admin/menu/new') return 'Add New Dish';
    if (path.startsWith('/admin/menu/')) return 'Edit Dish';
    if (path.startsWith('/admin/menu')) return 'Menu Catalog';
    if (path.startsWith('/admin/categories')) return 'Category Management';
    if (path.startsWith('/admin/customers')) return 'Customer Directory';
    if (path.startsWith('/admin/analytics')) return 'Performance Analytics';
    if (path.startsWith('/admin/settings')) return 'Restaurant Settings';
    if (path.startsWith('/admin/profile')) return 'Administrator Profile';
    return 'Management Console';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E6E1D5] px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-[#1A1814] hover:bg-[#FAF8F5] lg:hidden"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-[#1A1814] leading-tight">
            {getPageTitle(pathname)}
          </h1>
          <p className="hidden sm:block text-[11px] text-[#77736C]">
            Grand View Restaurant • Management Portal
          </p>
        </div>
      </div>

      {/* Right: Restaurant Open Toggle, Quick Action, Active Orders */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Master Open / Closed Status Button */}
        <button
          type="button"
          onClick={handleToggleStoreStatus}
          disabled={isUpdatingStatus}
          title="Click to toggle restaurant ordering status"
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="font-bold">{isOpen ? 'Orders Open' : 'Orders Closed'}</span>
        </button>

        {/* Live Active Orders Badge */}
        <Link
          href="/admin/orders"
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs font-semibold text-[#1A1814] hover:border-[#C99A4A]/50 transition-colors"
        >
          <Clock className="w-3.5 h-3.5 text-[#C99A4A]" />
          <span className="hidden sm:inline">Active:</span>
          <span className="w-5 h-5 rounded-full bg-[#1D1B18] text-white text-[11px] font-bold flex items-center justify-center">
            {activeOrdersCount}
          </span>
        </Link>

        {/* Quick Add Dish CTA */}
        <Link
          href="/admin/menu/new"
          className="btn-gold py-1.5 px-3 text-xs inline-flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Dish</span>
        </Link>
      </div>
    </header>
  );
}
