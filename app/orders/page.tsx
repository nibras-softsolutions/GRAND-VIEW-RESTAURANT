'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyCartBar from '@/components/StickyCartBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useOrders } from '@/context/OrderContext';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Clock, ChevronRight, RotateCcw } from 'lucide-react';

export default function OrdersPage() {
  const { orders } = useOrders();
  const { addToCart, showToast } = useCart();

  const handleReorder = (order: typeof orders[0], e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (order.items && order.items.length > 0) {
      order.items.forEach((ci) => {
        addToCart(ci.foodItem, ci.quantity, ci.selectedAddOns);
      });
      showToast(`Items from ${order.id} re-added to cart!`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-16 text-left">
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/"
            className="p-1.5 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-white transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
              My Orders
            </h1>
            <p className="text-xs text-[#77736C]">
              Your online food orders & delivery history
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-[#E6E1D5] shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A] mx-auto mb-3">
              <Clock className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-lg font-bold text-[#1A1814] mb-1">
              No orders placed yet
            </h2>
            <p className="text-xs text-[#77736C] mb-5">
              Browse our restaurant menu and order your favourite meal.
            </p>
            <Link
              href="/menu"
              className="btn-gold py-2.5 px-6 text-xs uppercase tracking-wider inline-flex"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {orders.map((order) => {
              const isDelivered = order.status === 'delivered';
              const cleanId = order.id.replace('#', '');

              return (
                <Link
                  key={order.id}
                  href={`/order/${encodeURIComponent(cleanId)}`}
                  className="block bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] hover:border-[#C99A4A]/60 shadow-xs hover:shadow-xs transition-all group text-left"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1814] group-hover:text-[#C99A4A] transition-colors">
                          {order.id}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isDelivered
                              ? 'bg-green-100 text-green-800'
                              : 'bg-[#FBF6EE] text-[#C99A4A] border border-[#E6E1D5]'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#77736C] mt-0.5 truncate max-w-[280px]">
                        {order.createdAt} • {order.deliveryAddress || 'Kochi Delivery'}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#77736C] group-hover:text-[#C99A4A] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Dishes summary */}
                  <div className="py-2 border-y border-[#E6E1D5]/60 text-xs text-[#1A1814] space-y-1">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-[#77736C]">
                            {item.foodItem?.name || 'Dish'} × {item.quantity}
                          </span>
                          <span className="font-medium">₹{item.itemTotal}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#77736C]">Butter Chicken, Garlic Naan</p>
                    )}
                  </div>

                  {/* Bottom row */}
                  <div className="pt-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#77736C]">Total: </span>
                      <span className="text-sm sm:text-base font-bold text-[#1A1814]">
                        ₹{order.total}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => handleReorder(order, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#E6E1D5] hover:border-[#C99A4A] text-[11px] font-semibold text-[#C99A4A] bg-[#FBF6EE] hover:bg-[#C99A4A] hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reorder</span>
                      </button>

                      <span className="text-xs font-semibold text-[#C99A4A] hover:underline">
                        {isDelivered ? 'View Receipt' : 'Live Tracking'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <StickyCartBar />
      <MobileBottomNav />
    </div>
  );
}
