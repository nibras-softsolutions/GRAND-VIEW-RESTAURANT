'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import {
  ArrowLeft,
  BedDouble,
  Phone,
  CreditCard,
  Banknote,
  Receipt,
  AlertCircle,
  Building,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, deliveryCharge, tax, total, clearCart, guestInfo, updateGuestInfo, setIsRoomModalOpen } = useCart();
  const { createOrder } = useOrders();

  const [phone, setPhone] = useState(guestInfo.phone || '+91 98765 43210');
  const [guestName, setGuestName] = useState(guestInfo.name || 'Alexander Wright');
  const [paymentMethod, setPaymentMethod] = useState<'pay-at-hotel' | 'add-to-room'>('pay-at-hotel');
  const [paymentSubOption, setPaymentSubOption] = useState<'cash' | 'card'>('card');
  const [errors, setErrors] = useState<{ phone?: string; room?: string; cart?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { phone?: string; room?: string; cart?: string } = {};

    if (cart.length === 0) {
      newErrors.cart = 'Your cart is empty. Please add dishes before placing an order.';
    }

    if (!guestInfo.roomNumber.trim()) {
      newErrors.room = 'Room number is required for in-room delivery.';
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      newErrors.phone = 'Please provide a valid contact number for room service updates.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    updateGuestInfo({ phone, name: guestName });

    const created = createOrder({
      items: cart,
      subtotal,
      deliveryCharge,
      tax,
      total,
      roomNumber: `Room ${guestInfo.roomNumber}`,
      guestName,
      phone,
      paymentMethod,
      paymentSubOption: paymentMethod === 'pay-at-hotel' ? paymentSubOption : undefined,
    });

    clearCart();

    setTimeout(() => {
      router.push(`/order/success?id=${encodeURIComponent(created.id)}`);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Header />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-16 text-left">
        {/* Header matching Screen 6 */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/cart"
            className="p-1.5 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-white transition-colors"
            aria-label="Back to cart"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
            Checkout
          </h1>
        </div>

        {errors.cart && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.cart}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-4 sm:space-y-5">
          {/* 1. DELIVERY DETAILS matching Screen 6 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Delivery Details
            </h2>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FBF6EE] border border-[#C99A4A]/25 flex items-center justify-center text-[#C99A4A] shrink-0">
                  <Building className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#1A1814]">
                    Room {guestInfo.roomNumber}
                  </h3>
                  <p className="text-[11px] text-[#77736C]">Grand View Hotel</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRoomModalOpen(true)}
                className="text-xs font-semibold text-[#C99A4A] hover:text-[#B0853D] px-2.5 py-1 rounded-md border border-[#C99A4A]/30 bg-white hover:bg-[#FBF6EE] transition-colors"
              >
                Change
              </button>
            </div>
          </div>

          {/* 2. CONTACT NUMBER matching Screen 6 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Contact Number
            </h2>

            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736C]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="+91 98765 43210"
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border text-xs sm:text-sm text-[#1A1814] focus:outline-none transition-colors ${
                  errors.phone
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#E6E1D5] focus:border-[#C99A4A]'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-[#C94A4A] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* 3. ORDER SUMMARY matching Screen 6 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Order Summary
            </h2>

            {cart.length === 0 ? (
              <p className="text-xs text-[#77736C]">No dishes selected.</p>
            ) : (
              <div className="divide-y divide-[#E6E1D5]/70 space-y-2">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="pt-2 first:pt-0 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-[#1A1814]">
                        {item.foodItem.name} {item.quantity > 1 && `× ${item.quantity}`}
                      </span>
                      {item.selectedAddOns.length > 0 && (
                        <p className="text-[10px] text-[#77736C]">
                          + {item.selectedAddOns.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-[#1A1814]">
                      ₹{item.itemTotal}
                    </span>
                  </div>
                ))}

                <div className="pt-3 space-y-2 text-xs sm:text-sm text-[#77736C]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#1A1814]">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-semibold text-[#1A1814]">₹{deliveryCharge}</span>
                  </div>
                  <div className="border-t border-[#E6E1D5] pt-2.5 flex justify-between text-base font-bold text-[#1A1814]">
                    <span>Total</span>
                    <span className="text-xl font-bold text-[#C99A4A]">₹{total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. PAYMENT METHOD matching Screen 6 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Payment Method
            </h2>

            <div className="space-y-2.5">
              {/* Option 1: Pay at Hotel */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'pay-at-hotel'
                    ? 'border-[#C99A4A] bg-[#FBF6EE]'
                    : 'border-[#E6E1D5] hover:border-[#C99A4A]/40'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'pay-at-hotel'}
                  onChange={() => setPaymentMethod('pay-at-hotel')}
                  className="mt-0.5 text-[#C99A4A] focus:ring-[#C99A4A]"
                />
                <div className="flex-1">
                  <span className="text-xs sm:text-sm font-bold text-[#1A1814]">
                    Pay at Hotel (Cash / Card)
                  </span>
                  <p className="text-[11px] text-[#77736C] mt-0.5">
                    Pay our steward upon delivery to Room {guestInfo.roomNumber}.
                  </p>

                  {paymentMethod === 'pay-at-hotel' && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-[#E6E1D5]">
                      <button
                        type="button"
                        onClick={() => setPaymentSubOption('card')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                          paymentSubOption === 'card'
                            ? 'bg-[#C99A4A] text-white border-[#C99A4A]'
                            : 'bg-white text-[#1A1814] border-[#E6E1D5]'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Card Machine</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentSubOption('cash')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                          paymentSubOption === 'cash'
                            ? 'bg-[#C99A4A] text-white border-[#C99A4A]'
                            : 'bg-white text-[#1A1814] border-[#E6E1D5]'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Cash</span>
                      </button>
                    </div>
                  )}
                </div>
              </label>

              {/* Option 2: Add to Room Bill */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'add-to-room'
                    ? 'border-[#C99A4A] bg-[#FBF6EE]'
                    : 'border-[#E6E1D5] hover:border-[#C99A4A]/40'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'add-to-room'}
                  onChange={() => setPaymentMethod('add-to-room')}
                  className="mt-0.5 text-[#C99A4A] focus:ring-[#C99A4A]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#1A1814]">
                    Add to Room (Your bill)
                  </span>
                  <p className="text-[11px] text-[#77736C] mt-0.5">
                    Charged to Room {guestInfo.roomNumber} folio and settled at checkout.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 5. PLACE ORDER BUTTON matching Screen 6 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full btn-gold py-3.5 px-6 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Place Order'}</span>
            </button>
          </div>
        </form>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
