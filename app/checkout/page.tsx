'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { RESTAURANT_INFO } from '@/data/menuData';
import { OrderType, PaymentMethod } from '@/types';
import {
  ArrowLeft,
  Phone,
  CreditCard,
  Banknote,
  MapPin,
  Clock,
  AlertCircle,
  Building2,
  Bike,
  Store,
  CheckCircle2,
  User,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, deliveryCharge: defaultDeliveryCharge, tax, total: cartTotal, clearCart, customerInfo, updateCustomerInfo } = useCart();
  const { createOrder } = useOrders();

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState(customerInfo.name || 'Alexander Wright');
  const [phone, setPhone] = useState(customerInfo.phone || '+91 98765 43210');
  const [deliveryAddress, setDeliveryAddress] = useState(customerInfo.deliveryAddress || 'Flat 4B, Marine View Heights, Waterfront Promenade, Kochi');
  const [landmark, setLandmark] = useState(customerInfo.landmark || 'Near Waterfront Light House');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash-on-delivery');
  const [paymentSubOption, setPaymentSubOption] = useState<'cash' | 'card' | 'upi'>('cash');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string; cart?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery fee is 0 for pickup, or ₹40 for delivery (free over ₹500)
  const isPickup = orderType === 'pickup';
  const effectiveDeliveryFee = isPickup ? 0 : defaultDeliveryCharge;
  const effectiveTotal = subtotal + effectiveDeliveryFee + tax;

  const validate = () => {
    const newErrors: { name?: string; phone?: string; address?: string; cart?: string } = {};

    if (cart.length === 0) {
      newErrors.cart = 'Your cart is empty. Please add dishes before placing an order.';
    }

    if (!customerName.trim()) {
      newErrors.name = 'Please provide your full name.';
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      newErrors.phone = 'Please provide a valid 10-digit phone number for delivery updates.';
    }

    if (!isPickup && !deliveryAddress.trim()) {
      newErrors.address = 'Please provide a complete delivery street address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    updateCustomerInfo({
      name: customerName,
      phone,
      deliveryAddress,
      landmark,
    });

    const created = createOrder({
      items: cart,
      subtotal,
      deliveryCharge: effectiveDeliveryFee,
      tax,
      total: effectiveTotal,
      orderType,
      deliveryAddress: isPickup ? 'Grand View Restaurant (Front Counter Pickup)' : deliveryAddress,
      landmark: isPickup ? undefined : landmark,
      customerName,
      phone,
      paymentMethod,
      paymentSubOption,
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/cart"
            className="p-1.5 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-white transition-colors"
            aria-label="Back to cart"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
              Checkout
            </h1>
            <p className="text-xs text-[#77736C]">Grand View Restaurant Online Ordering</p>
          </div>
        </div>

        {errors.cart && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.cart}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-4 sm:space-y-5">
          {/* 1. ORDER TYPE SELECTOR */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Order Type
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  orderType === 'delivery'
                    ? 'border-[#C99A4A] bg-[#FBF6EE] ring-1 ring-[#C99A4A]'
                    : 'border-[#E6E1D5] bg-white hover:border-[#C99A4A]/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  orderType === 'delivery' ? 'bg-[#C99A4A] text-white' : 'bg-[#FAF8F5] text-[#77736C]'
                }`}>
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#1A1814]">
                    Doorstep Delivery
                  </div>
                  <div className="text-[11px] text-[#77736C]">30–35 mins</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  orderType === 'pickup'
                    ? 'border-[#C99A4A] bg-[#FBF6EE] ring-1 ring-[#C99A4A]'
                    : 'border-[#E6E1D5] bg-white hover:border-[#C99A4A]/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  orderType === 'pickup' ? 'bg-[#C99A4A] text-white' : 'bg-[#FAF8F5] text-[#77736C]'
                }`}>
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#1A1814]">
                    Takeaway Pickup
                  </div>
                  <div className="text-[11px] text-[#77736C]">15–20 mins (Free)</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. CUSTOMER & DELIVERY / PICKUP DETAILS */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              {isPickup ? 'Customer Details' : 'Delivery Address'}
            </h2>

            {/* Name input */}
            <div>
              <label className="text-xs font-semibold text-[#1A1814] block mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736C]" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Alexander Wright"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                />
              </div>
              {errors.name && <p className="text-xs text-[#C94A4A] mt-1">{errors.name}</p>}
            </div>

            {/* Contact phone */}
            <div>
              <label className="text-xs font-semibold text-[#1A1814] block mb-1">
                Phone Number
              </label>
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                />
              </div>
              {errors.phone && <p className="text-xs text-[#C94A4A] mt-1">{errors.phone}</p>}
            </div>

            {/* If Delivery: Street address & landmark */}
            {!isPickup ? (
              <div className="space-y-3 pt-1 border-t border-[#E6E1D5]">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#1A1814]">
                      Complete Street Address
                    </label>
                    <span className="text-[10px] text-[#C99A4A] font-semibold">Kochi City Delivery</span>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#77736C]" />
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      placeholder="Flat 4B, Marine View Heights, Waterfront Promenade, Kochi"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                    />
                  </div>
                  {errors.address && <p className="text-xs text-[#C94A4A] mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1814] block mb-1">
                    Landmark / Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite Waterfront Light House, Gate 2"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                  />
                </div>
              </div>
            ) : (
              /* If Pickup: Restaurant counter address */
              <div className="p-3.5 rounded-xl bg-[#FBF6EE] border border-[#C99A4A]/30 flex items-start gap-3">
                <Store className="w-5 h-5 text-[#C99A4A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#1A1814]">
                    Grand View Restaurant Pickup Counter
                  </h4>
                  <p className="text-[11px] text-[#77736C] mt-0.5 leading-relaxed">
                    Marine Promenade, Waterfront Drive, Kochi, Kerala 682001
                  </p>
                  <p className="text-[10px] font-semibold text-[#C99A4A] mt-1">
                    Ready in 15–20 minutes. Please show order confirmation on arrival.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 3. ORDER SUMMARY */}
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
                    <span className="font-semibold text-[#1A1814]">
                      {effectiveDeliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `₹${effectiveDeliveryFee}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST & Restaurant Charges (5%)</span>
                    <span className="font-semibold text-[#1A1814]">₹{tax}</span>
                  </div>
                  <div className="border-t border-[#E6E1D5] pt-2.5 flex justify-between text-base font-bold text-[#1A1814]">
                    <span>Total Amount</span>
                    <span className="text-xl font-bold text-[#C99A4A]">₹{effectiveTotal}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. PAYMENT METHOD */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Payment Method
            </h2>

            <div className="space-y-2.5">
              {/* Option 1: Cash on Delivery / Pay on Delivery */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cash-on-delivery'
                    ? 'border-[#C99A4A] bg-[#FBF6EE]'
                    : 'border-[#E6E1D5] hover:border-[#C99A4A]/40'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cash-on-delivery'}
                  onChange={() => setPaymentMethod('cash-on-delivery')}
                  className="mt-0.5 text-[#C99A4A] focus:ring-[#C99A4A]"
                />
                <div className="flex-1">
                  <span className="text-xs sm:text-sm font-bold text-[#1A1814]">
                    {isPickup ? 'Pay at Counter (Cash / Card)' : 'Cash / Pay on Delivery'}
                  </span>
                  <p className="text-[11px] text-[#77736C] mt-0.5">
                    {isPickup
                      ? 'Pay with cash, card, or UPI when picking up your order.'
                      : 'Pay our delivery rider via cash, card machine, or UPI QR code upon arrival.'}
                  </p>

                  {paymentMethod === 'cash-on-delivery' && !isPickup && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-[#E6E1D5]">
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
                    </div>
                  )}
                </div>
              </label>

              {/* Option 2: Online Payment / UPI */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'online-payment'
                    ? 'border-[#C99A4A] bg-[#FBF6EE]'
                    : 'border-[#E6E1D5] hover:border-[#C99A4A]/40'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'online-payment'}
                  onChange={() => setPaymentMethod('online-payment')}
                  className="mt-0.5 text-[#C99A4A] focus:ring-[#C99A4A]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#1A1814]">
                    Online Payment (Instant UPI / Cards)
                  </span>
                  <p className="text-[11px] text-[#77736C] mt-0.5">
                    Seamless contactless payment via Google Pay, PhonePe, Paytm or Credit/Debit Card.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 5. PLACE ORDER BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full btn-gold py-3.5 px-6 text-sm font-semibold flex items-center justify-between disabled:opacity-50 cursor-pointer shadow-md"
            >
              <span>{isSubmitting ? 'Placing Order...' : isPickup ? 'Place Takeaway Order' : 'Place Delivery Order'}</span>
              <span className="font-bold">₹{effectiveTotal}</span>
            </button>
          </div>
        </form>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
