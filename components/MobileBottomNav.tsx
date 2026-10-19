'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Home, UtensilsCrossed, ShoppingBag, Clock, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalCount, setIsCartDrawerOpen } = useCart();

  const navItems = [
    { label: 'Home', href: '/', icon: Home, isAction: false },
    { label: 'Menu', href: '/menu', icon: UtensilsCrossed, isAction: false },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingBag,
      isAction: true,
      badge: totalCount,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setIsCartDrawerOpen(true);
      },
    },
    { label: 'Orders', href: '/orders', icon: Clock, isAction: false },
    { label: 'Profile', href: '/profile', icon: User, isAction: false },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E3D8] md:hidden px-3 py-2 pb-safe"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          if (item.isAction && item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center py-1 px-3 relative min-w-[56px] text-center"
                aria-label={`Open Cart (${totalCount} items)`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-[#B98A3E]' : 'text-[#77736C]'
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#B98A3E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium transition-colors ${
                    isActive ? 'text-[#B98A3E] font-semibold' : 'text-[#77736C]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center py-1 px-3 relative min-w-[56px] text-center"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#B98A3E]' : 'text-[#77736C]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${
                  isActive ? 'text-[#B98A3E] font-semibold' : 'text-[#77736C]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
