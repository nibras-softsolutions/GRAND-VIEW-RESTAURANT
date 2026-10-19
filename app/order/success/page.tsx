'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useOrders } from '@/context/OrderContext';
import { Check, Clock, MapPin, ArrowRight, UtensilsCrossed, Store } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '#GV20261019';
  const { getOrderById, currentOrder } = useOrders();

  const order = getOrderById(orderId) || currentOrder || {
    id: orderId,
    estimatedTime: '30–35 mins',
    deliveryAddress: 'Kunnumpuram House, Near Old Juma Masjid, Amini, Lakshadweep',
    orderType: 'delivery',
    total: 490,
  };

  const isPickup = order.orderType === 'pickup';

  return (
    <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 pb-28 md:pb-16 flex flex-col items-center text-center">
      {/* Gold Circular Check Icon matching Screen 7 */}
      <div className="w-18 h-18 rounded-full bg-[#C99A4A] text-white flex items-center justify-center shadow-lg shadow-[#C99A4A]/25 mb-5 animate-fade-in">
        <Check className="w-9 h-9 stroke-[3]" />
      </div>

      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814] mb-1">
        Order Placed!
      </h1>
      <p className="text-xs sm:text-sm text-[#77736C] mb-6">
        Thank you for ordering from Grand View Restaurant.
      </p>

      {/* Order Info Card matching Screen 7 */}
      <div className="w-full bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs mb-6 space-y-3.5 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D5]/70">
          <span className="text-xs text-[#77736C]">Order ID</span>
          <span className="font-serif text-sm sm:text-base font-bold text-[#1A1814]">
            {order.id}
          </span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D5]/70">
          <div className="flex items-center gap-2 text-xs text-[#77736C]">
            <Clock className="w-4 h-4 text-[#C99A4A]" />
            <span>Estimated Time</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-[#1A1814]">
            {order.estimatedTime || (isPickup ? '15–20 mins' : '30–35 mins')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#77736C]">
            {isPickup ? (
              <Store className="w-4 h-4 text-[#C99A4A]" />
            ) : (
              <MapPin className="w-4 h-4 text-[#C99A4A]" />
            )}
            <span>{isPickup ? 'Pickup At' : 'Delivery To'}</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-[#1A1814] max-w-[200px] truncate text-right">
            {order.deliveryAddress || 'Your delivery address'}
          </span>
        </div>
      </div>

      {/* Primary CTA matching Screen 7 */}
      <div className="w-full space-y-2.5">
        <Link
          href={`/order/${encodeURIComponent(order.id.replace('#', ''))}`}
          className="w-full btn-gold py-3.5 px-6 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <span>Track Order</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/menu"
          className="w-full py-2.5 px-6 rounded-full border border-[#E6E1D5] hover:border-[#C99A4A]/60 text-xs font-semibold text-[#77736C] hover:text-[#1A1814] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Back to Menu</span>
        </Link>
      </div>

      {/* Restaurant Thank You Cloche matching Screen 7 */}
      <div className="mt-10 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A] mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 18h16" />
            <path d="M12 4a1 1 0 0 1 1 1v1a8 8 0 0 1 7.93 7H3.07A8 8 0 0 1 11 6V5a1 1 0 0 1 1-1Z" />
            <path d="M12 4V2" />
          </svg>
        </div>
        <p className="font-serif text-xs sm:text-sm font-bold text-[#1A1814]">
          Thank you for choosing Grand View Restaurant
        </p>

        {/* Small golden lotus mark */}
        <div className="mt-2 text-[#C99A4A] text-xs">
          ✦
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sm text-[#77736C]">Loading confirmation...</div>}>
        <OrderSuccessContent />
      </Suspense>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
