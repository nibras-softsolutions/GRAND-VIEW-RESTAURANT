'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { OrderType, PaymentMethod, SavedAddress } from '@/types';
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
  Home,
  Check,
  Plus,
} from 'lucide-react';

const LAKSHADWEEP_ISLANDS = [
  'Amini',
  'Kavaratti',
  'Agatti',
  'Kadmat',
  'Andrott',
  'Kalpeni',
  'Kilthan',
  'Chetlat',
  'Bitra',
  'Minicoy',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, deliveryCharge: defaultDeliveryCharge, tax, total: cartTotal, clearCart, customerInfo, updateCustomerInfo } = useCart();
  const { createOrder } = useOrders();

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState(customerInfo.name || 'Mohammed Shafi');
  const [phone, setPhone] = useState(customerInfo.phone || '+91 94473 45678');

  // Lakshadweep Local Delivery Address Fields
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  const [island, setIsland] = useState(customerInfo.island || 'Amini');
  const [houseName, setHouseName] = useState(customerInfo.houseName || 'Kunnumpuram House');
  const [locality, setLocality] = useState(customerInfo.locality || 'Near Old Juma Masjid');
  const [landmark, setLandmark] = useState(customerInfo.landmark || 'Opposite BSNL Tower');
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    customerInfo.deliveryInstructions || 'Please call when you reach nearby.'
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash-on-delivery');
  const [paymentSubOption, setPaymentSubOption] = useState<'cash' | 'card' | 'upi'>('cash');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; houseName?: string; locality?: string; cart?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch saved customer addresses from Neon DB
  useEffect(() => {
    fetch('/api/customer')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) {
          if (data.profile.name) setCustomerName(data.profile.name);
          if (data.profile.phone) setPhone(data.profile.phone);
          if (data.profile.savedAddresses && data.profile.savedAddresses.length > 0) {
            setSavedAddresses(data.profile.savedAddresses);
            const defaultAddr = data.profile.savedAddresses.find((a: SavedAddress) => a.isDefault) || data.profile.savedAddresses[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              setIsland(defaultAddr.island || 'Amini');
              setHouseName(defaultAddr.houseName || 'Kunnumpuram House');
              setLocality(defaultAddr.locality || 'Near Old Juma Masjid');
              setLandmark(defaultAddr.landmark || 'Opposite BSNL Tower');
              setDeliveryInstructions(defaultAddr.deliveryInstructions || 'Please call when you reach nearby.');
            }
          } else {
            setUseCustomAddress(true);
          }
        }
      })
      .catch((err) => console.log('Offline: using local address defaults', err));
  }, []);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setUseCustomAddress(false);
    if (addr.fullName) setCustomerName(addr.fullName);
    if (addr.phone) setPhone(addr.phone);
    setIsland(addr.island || 'Amini');
    setHouseName(addr.houseName || 'Kunnumpuram House');
    setLocality(addr.locality || 'Near Old Juma Masjid');
    setLandmark(addr.landmark || '');
    setDeliveryInstructions(addr.deliveryInstructions || '');
  };

  // Delivery fee is 0 for pickup, or ₹40 for delivery (free over ₹500)
  const isPickup = orderType === 'pickup';
  const effectiveDeliveryFee = isPickup ? 0 : defaultDeliveryCharge;
  const effectiveTotal = subtotal + effectiveDeliveryFee + tax;

  const validate = () => {
    const newErrors: { name?: string; phone?: string; houseName?: string; locality?: string; cart?: string } = {};

    if (cart.length === 0) {
      newErrors.cart = 'Your cart is empty. Please add dishes before placing an order.';
    }

    if (!customerName.trim()) {
      newErrors.name = 'Please provide your full name.';
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      newErrors.phone = 'Please provide a valid phone number for delivery contact.';
    }

    if (!isPickup) {
      if (!houseName.trim()) {
        newErrors.houseName = 'House name or house number is required.';
        setUseCustomAddress(true);
      }
      if (!locality.trim()) {
        newErrors.locality = 'Area or locality is required.';
        setUseCustomAddress(true);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const formattedAddress = isPickup
      ? 'Alfiya Kitchen (Front Counter Pickup)'
      : `${houseName.trim()}, ${locality.trim()}, ${island}, Lakshadweep`;

    try {
      const payload = {
        orderType,
        deliveryAddress: formattedAddress,
        island: isPickup ? undefined : island,
        houseName: isPickup ? undefined : houseName.trim(),
        locality: isPickup ? undefined : locality.trim(),
        landmark: isPickup ? undefined : landmark.trim(),
        deliveryInstructions: isPickup ? undefined : deliveryInstructions.trim(),
        customerName: customerName.trim(),
        phone: phone.trim(),
        paymentMethod,
        paymentSubOption,
        items: cart,
        subtotal,
        deliveryCharge: effectiveDeliveryFee,
        tax,
        total: effectiveTotal,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order. Please review your cart.');
      }

      updateCustomerInfo({
        name: customerName,
        phone,
        island,
        houseName,
        locality,
        landmark,
        deliveryInstructions,
        deliveryAddress: formattedAddress,
      });

      const createdOrder = data.order || createOrder(payload);
      clearCart();

      router.push(`/order/success?id=${encodeURIComponent(createdOrder.id)}`);
    } catch (err: any) {
      console.error('Order placement error:', err);
      setGeneralError(err.message || 'Something went wrong while placing your order. Please try again.');
      setIsSubmitting(false);
    }
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
            <p className="text-xs text-[#77736C]">Alfiya Kitchen • Lakshadweep</p>
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
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${orderType === 'delivery'
                    ? 'border-[#C99A4A] bg-[#FBF6EE] ring-1 ring-[#C99A4A]'
                    : 'border-[#E6E1D5] bg-white hover:border-[#C99A4A]/50'
                  }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${orderType === 'delivery' ? 'bg-[#C99A4A] text-white' : 'bg-[#FAF8F5] text-[#77736C]'
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
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${orderType === 'pickup'
                    ? 'border-[#C99A4A] bg-[#FBF6EE] ring-1 ring-[#C99A4A]'
                    : 'border-[#E6E1D5] bg-white hover:border-[#C99A4A]/50'
                  }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${orderType === 'pickup' ? 'bg-[#C99A4A] text-white' : 'bg-[#FAF8F5] text-[#77736C]'
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

          {/* 2. CUSTOMER & DELIVERY ADDRESS */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              {isPickup ? 'Customer Details' : 'Delivery Address (Lakshadweep)'}
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
                  placeholder="Mohammed Shafi"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                />
              </div>
              {errors.name && <p className="text-xs text-[#C94A4A] mt-1">{errors.name}</p>}
            </div>

            {/* Contact phone */}
            <div>
              <label className="text-xs font-semibold text-[#1A1814] block mb-1">
                Mobile Number for Delivery Updates
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
                  placeholder="+91 94473 45678"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                />
              </div>
              {errors.phone && <p className="text-xs text-[#C94A4A] mt-1">{errors.phone}</p>}
            </div>

            {/* Delivery Location Section */}
            {!isPickup && (
              <div className="space-y-3 pt-2 border-t border-[#E6E1D5]">
                {/* Saved addresses selector */}
                {savedAddresses.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-[#1A1814] block mb-2">
                      Choose Saved Address
                    </label>
                    <div className="space-y-2">
                      {savedAddresses.map((addr) => {
                        const isSelected = !useCustomAddress && selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${isSelected
                                ? 'border-[#C99A4A] bg-[#FBF6EE] ring-1 ring-[#C99A4A]'
                                : 'border-[#E6E1D5] bg-[#FAF9F6] hover:border-[#C99A4A]/50'
                              }`}
                          >
                            <div className="flex items-center justify-between font-bold text-[#1A1814]">
                              <span className="flex items-center gap-1.5">
                                <Home className="w-3.5 h-3.5 text-[#C99A4A]" />
                                <span>{addr.label}</span>
                                {addr.isDefault && (
                                  <span className="text-[10px] bg-[#C99A4A]/10 text-[#C99A4A] px-1.5 py-0.5 rounded-md font-semibold">
                                    Default
                                  </span>
                                )}
                              </span>
                              {isSelected && <Check className="w-4 h-4 text-[#C99A4A]" />}
                            </div>
                            <p className="font-semibold mt-1 text-[#1A1814]">
                              {addr.houseName}, {addr.locality} ({addr.island})
                            </p>
                            {addr.landmark && (
                              <p className="text-[11px] text-[#77736C]">Landmark: {addr.landmark}</p>
                            )}
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setUseCustomAddress(!useCustomAddress)}
                        className="text-xs font-semibold text-[#C99A4A] hover:underline flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{useCustomAddress ? 'Use saved address' : 'Enter different delivery address'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Local Address Inputs (Always shown if no saved addresses, or if custom address selected) */}
                {(savedAddresses.length === 0 || useCustomAddress) && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-[#1A1814] block mb-1">
                        Select Island
                      </label>
                      <select
                        value={island}
                        onChange={(e) => setIsland(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                      >
                        {LAKSHADWEEP_ISLANDS.map((isl) => (
                          <option key={isl} value={isl}>
                            {isl} Island
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#1A1814] block mb-1">
                        House Name / House Number
                      </label>
                      <input
                        type="text"
                        value={houseName}
                        onChange={(e) => {
                          setHouseName(e.target.value);
                          if (errors.houseName) setErrors((prev) => ({ ...prev, houseName: undefined }));
                        }}
                        placeholder="e.g. Kunnumpuram House / ABC House"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                      />
                      {errors.houseName && <p className="text-xs text-[#C94A4A] mt-1">{errors.houseName}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#1A1814] block mb-1">
                        Area / Locality
                      </label>
                      <input
                        type="text"
                        value={locality}
                        onChange={(e) => {
                          setLocality(e.target.value);
                          if (errors.locality) setErrors((prev) => ({ ...prev, locality: undefined }));
                        }}
                        placeholder="e.g. Near Old Juma Masjid / Hospital Road"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                      />
                      {errors.locality && <p className="text-xs text-[#C94A4A] mt-1">{errors.locality}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#1A1814] block mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Opposite BSNL Tower / Near Jetty"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#1A1814] block mb-1">
                        Additional Delivery Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        placeholder="e.g. Please call when you reach nearby."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. PAYMENT METHOD */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Payment Method
            </h2>

            <div className="space-y-2">
              <label
                onClick={() => setPaymentMethod('cash-on-delivery')}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cash-on-delivery'
                    ? 'border-[#C99A4A] bg-[#FBF6EE] ring-1 ring-[#C99A4A]'
                    : 'border-[#E6E1D5] bg-white hover:border-[#C99A4A]/50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#1A1814] block">
                      Cash on Delivery
                    </span>
                    <span className="text-[11px] text-[#77736C]">
                      Pay in cash or UPI scan when your food arrives
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cash-on-delivery'}
                  onChange={() => setPaymentMethod('cash-on-delivery')}
                  className="accent-[#C99A4A]"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('online-payment')}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'online-payment'
                    ? 'border-[#C99A4A] bg-[#FBF6EE] ring-1 ring-[#C99A4A]'
                    : 'border-[#E6E1D5] bg-white hover:border-[#C99A4A]/50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#1A1814] block">
                      UPI / Online Payment
                    </span>
                    <span className="text-[11px] text-[#77736C]">
                      Instant QR transfer / GooglePay / PhonePe
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'online-payment'}
                  onChange={() => setPaymentMethod('online-payment')}
                  className="accent-[#C99A4A]"
                />
              </label>

              {isPickup && (
                <label
                  onClick={() => setPaymentMethod('pay-at-pickup')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'pay-at-pickup'
                      ? 'border-[#C99A4A] bg-[#FBF6EE] ring-1 ring-[#C99A4A]'
                      : 'border-[#E6E1D5] bg-white hover:border-[#C99A4A]/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-[#1A1814] block">
                        Pay at Restaurant Counter
                      </span>
                      <span className="text-[11px] text-[#77736C]">
                        Settle bill when picking up your parcel
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'pay-at-pickup'}
                    onChange={() => setPaymentMethod('pay-at-pickup')}
                    className="accent-[#C99A4A]"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 4. ORDER SUMMARY */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Order Summary ({cart.length} items)
            </h2>

            <div className="divide-y divide-[#E6E1D5]/60 text-xs">
              {cart.map((item) => (
                <div key={item.cartItemId} className="py-2.5 flex justify-between">
                  <div>
                    <span className="font-bold text-[#1A1814]">{item.quantity}×</span>{' '}
                    <span className="font-medium text-[#1A1814]">{item.foodItem.name}</span>
                    {item.selectedAddOns.length > 0 && (
                      <p className="text-[10px] text-[#77736C]">
                        + {item.selectedAddOns.map((a) => a.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-[#1A1814]">₹{item.itemTotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E6E1D5] space-y-1.5 text-xs text-[#77736C]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#1A1814]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-medium text-[#1A1814]">
                  {effectiveDeliveryFee === 0 ? 'FREE' : `₹${effectiveDeliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-medium text-[#1A1814]">₹{tax}</span>
              </div>
              <div className="pt-2 border-t border-[#E6E1D5] flex justify-between text-base font-bold text-[#1A1814]">
                <span>Total Amount</span>
                <span className="text-[#C99A4A]">₹{effectiveTotal}</span>
              </div>
            </div>
          </div>

          {/* Validation & Server Error Banners */}
          {generalError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {(errors.name || errors.phone || errors.houseName || errors.locality) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {errors.houseName || errors.locality || errors.name || errors.phone || 'Please provide your delivery address details above.'}
              </span>
            </div>
          )}

          {/* Place Order CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full py-4 px-6 rounded-2xl btn-gold text-white font-serif font-bold text-base shadow-lg shadow-[#C99A4A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Confirming Order...</span>
              </div>
            ) : (
              <span>Place Order (₹{effectiveTotal})</span>
            )}
          </button>
        </form>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
