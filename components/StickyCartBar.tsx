'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function StickyCartBar() {
  const { totalCount, total, setIsCartDrawerOpen } = useCart();
  const pathname = usePathname();

  // Don't show on checkout or order success pages where cart is already being completed
  if (totalCount === 0 || pathname.includes('/checkout') || pathname.includes('/order/')) {
    return null;
  }

  return (
    <div className="fixed z-40 bottom-18 inset-x-3 sm:inset-x-4 md:hidden pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#25221E] text-white rounded-2xl shadow-xl border border-[#B98A3E]/40 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full bg-[#B98A3E] flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-[#1D1D1B] rounded-full text-[10px] font-bold flex items-center justify-center">
                {totalCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold tracking-wide">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} in cart
              </p>
              <p className="text-[11px] text-[#D8B46A]">
                ₹{total} • Free Room Delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D8B46A] tracking-wider uppercase">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
}
