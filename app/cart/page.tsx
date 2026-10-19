'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useCart } from '@/context/CartContext';
import { CartItem, AddOn } from '@/types';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, deliveryCharge, total } = useCart();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-16">
        {/* Header matching Screen 5 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="p-1.5 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-white transition-colors"
              aria-label="Back to menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
              Your Cart
            </h1>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E6E1D5] text-xs font-semibold text-[#1A1814]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Fast Doorstep Delivery</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-[#E6E1D5] shadow-xs max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A] mx-auto mb-3">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1A1814] mb-1">
              Your cart is empty
            </h2>
            <p className="text-xs text-[#77736C] mb-6 max-w-xs mx-auto">
              Add something delicious from our restaurant menu for fast home delivery or takeaway.
            </p>
            <Link
              href="/menu"
              className="btn-gold py-3 px-7 text-xs uppercase tracking-wider inline-flex"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Items List matching Screen 5 */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs divide-y divide-[#E6E1D5]/70">
              {cart.map((item: CartItem) => (
                <div key={item.cartItemId} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3.5">
                  {/* Food Image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#1D1B18] shrink-0 border border-[#E6E1D5]">
                    <Image
                      src={item.foodItem.image}
                      alt={item.foodItem.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-serif text-sm font-bold text-[#1A1814] truncate">
                      {item.foodItem.name}
                    </h3>

                    {item.selectedAddOns.length > 0 && (
                      <p className="text-[11px] text-[#77736C] truncate mt-0.5">
                        + {item.selectedAddOns.map((a: AddOn) => a.name).join(', ')}
                      </p>
                    )}

                    <div className="text-sm font-bold text-[#1A1814] mt-1">
                      ₹{item.itemTotal}
                    </div>
                  </div>

                  {/* Quantity Controls & Delete Icon matching Screen 5 */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-[#F8F6F1] border border-[#E6E1D5] rounded-lg px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-4 h-4 flex items-center justify-center text-[#1A1814] hover:opacity-70"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-3 text-center text-[#1A1814]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-4 h-4 flex items-center justify-center text-[#1A1814] hover:opacity-70"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-[#77736C] hover:text-[#C94A4A] p-1.5 transition-colors"
                      aria-label={`Remove ${item.foodItem.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary Card matching Screen 5 */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#1A1814]">
                Summary
              </h2>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-[#77736C]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1A1814]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[#77736C]">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-[#1A1814]">₹{deliveryCharge}</span>
                </div>
                <div className="border-t border-[#E6E1D5] pt-2.5 flex justify-between text-base font-bold text-[#1A1814]">
                  <span>Total</span>
                  <span className="text-xl font-bold text-[#C99A4A]">₹{total}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full btn-gold py-3.5 px-6 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/menu"
                className="block text-center text-xs font-semibold text-[#C99A4A] hover:underline"
              >
                + Add more dishes from menu
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
