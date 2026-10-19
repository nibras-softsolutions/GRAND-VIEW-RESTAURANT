'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  FolderTree,
  Users,
  BarChart3,
  Settings,
  UserCheck,
  LogOut,
  X,
  ChevronRight,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import HotelLogo from '@/components/HotelLogo';

interface AdminSidebarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'manager' | 'staff';
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ user, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error', e);
      router.push('/admin/login');
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Live Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      label: 'Menu Items',
      href: '/admin/menu',
      icon: UtensilsCrossed,
      subItems: [
        { label: 'All Items', href: '/admin/menu' },
        { label: 'Add New Dish', href: '/admin/menu/new' },
      ],
    },
    {
      label: 'Categories',
      href: '/admin/categories',
      icon: FolderTree,
    },
    {
      label: 'Customers',
      href: '/admin/customers',
      icon: Users,
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
    {
      label: 'My Profile',
      href: '/admin/profile',
      icon: UserCheck,
    },
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-[#C99A4A]/20 text-[#E5C07B] border-[#C99A4A]/30' };
      case 'manager':
        return { label: 'Manager', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      default:
        return { label: 'Staff', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#1D1B18] text-white flex flex-col border-r border-[#C99A4A]/20 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HotelLogo variant="light" size="sm" showTagline={false} />
            <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#C99A4A] text-[#1D1B18]">
              Admin
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#D1C9BE] hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 no-scrollbar text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#C99A4A] text-[#1D1B18] shadow-md shadow-[#C99A4A]/20'
                      : 'text-[#D1C9BE] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>

                {/* Sub-items if any */}
                {item.subItems && isActive && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => onClose()}
                          className={`block py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition-colors ${
                            isSubActive
                              ? 'text-[#E5C07B] font-semibold bg-white/5'
                              : 'text-[#A0988C] hover:text-white'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-3 border-t border-white/10 mt-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#A0988C] hover:text-[#E5C07B] hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Customer Website</span>
              </div>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-[#D1C9BE]">Live</span>
            </Link>
          </div>
        </nav>

        {/* User Card & Logout at Bottom */}
        <div className="p-3.5 border-t border-white/10 bg-[#161412]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#C99A4A]/20 border border-[#C99A4A]/40 flex items-center justify-center text-[#E5C07B] text-xs font-bold uppercase shrink-0">
                {user?.name ? user.name.slice(0, 2) : 'GV'}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <span
                  className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${roleInfo.bg}`}
                >
                  {roleInfo.label}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#A0988C] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
