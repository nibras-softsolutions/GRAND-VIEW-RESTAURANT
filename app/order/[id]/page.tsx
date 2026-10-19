'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useOrders } from '@/context/OrderContext';
import { OrderStatus } from '@/types';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Phone,
  ChefHat,
  Bike,
  Sparkles,
  Home,
  MapPin,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface OrderTrackPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderTrackPage({ params }: OrderTrackPageProps) {
  const resolvedParams = use(params);
  const rawId = decodeURIComponent(resolvedParams.id);
  const { getOrderById, currentOrder } = useOrders();

  const [order, setOrder] = useState<any>(() => {
    return getOrderById(rawId) || currentOrder || {
      id: rawId.startsWith('#') ? rawId : `#${rawId}`,
      createdAt: 'Today • Just now',
      items: [],
      subtotal: 450,
      deliveryCharge: 40,
      tax: 0,
      total: 490,
      orderType: 'delivery' as const,
      deliveryAddress: 'Kunnumpuram House, Near Old Juma Masjid, Amini, Lakshadweep',
      island: 'Amini',
      houseName: 'Kunnumpuram House',
      locality: 'Near Old Juma Masjid',
      landmark: 'Opposite BSNL Tower',
      customerName: 'Mohammed Shafi',
      phone: '+91 94473 45678',
      paymentMethod: 'cash-on-delivery' as const,
      status: 'confirmed' as OrderStatus,
      estimatedTime: '25–30 mins',
      timeline: [
        { status: 'confirmed' as OrderStatus, title: 'Order Confirmed', description: 'Received and confirmed by Grand View Restaurant.', completed: true, time: 'Just now' },
        { status: 'preparing' as OrderStatus, title: 'Preparing in Kitchen', description: 'Chefs are cooking your meal fresh.', completed: false },
        { status: 'out_for_delivery' as OrderStatus, title: 'Out for Delivery', description: 'Delivery partner on the way to your address.', completed: false },
        { status: 'delivered' as OrderStatus, title: 'Delivered', description: 'Delivered to your doorstep.', completed: false },
      ],
    };
  });

  const [loading, setLoading] = useState(false);

  // Poll database for live status updates from Admin or Delivery partner
  const fetchLiveOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(rawId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        }
      }
    } catch (e) {
      console.log('Background poll error', e);
    }
  };

  useEffect(() => {
    fetchLiveOrder();
    const interval = setInterval(fetchLiveOrder, 10000); // 10s poll for status changes
    return () => clearInterval(interval);
  }, [rawId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return CheckCircle2;
      case 'preparing':
        return ChefHat;
      case 'ready':
      case 'ready_for_pickup':
        return Clock;
      case 'out_for_delivery':
        return Bike;
      case 'delivered':
        return Sparkles;
      default:
        return Clock;
    }
  };

  const isDelivered = order.status === 'delivered';
  const isPickup = order.orderType === 'pickup';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Header />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-16 text-left">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="p-1.5 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-white transition-colors"
              aria-label="Back to orders"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
                Track Order
              </h1>
              <p className="text-xs text-[#77736C]">
                {order.id} • {order.island ? `${order.island} Island` : 'Grand View Restaurant'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchLiveOrder}
            className="p-2 rounded-xl bg-white border border-[#E6E1D5] text-[#77736C] hover:text-[#1A1814] transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C99A4A]' : ''}`} />
          </button>
        </div>

        {/* Estimated Arrival Banner */}
        <div className="bg-[#1D1B18] text-white rounded-2xl p-5 mb-5 shadow-xs border border-[#C99A4A]/25 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B] mb-1">
                {isDelivered ? 'Delivery Complete' : 'Estimated Time'}
              </p>
              <h2 className="font-serif text-2xl font-bold text-white">
                {isDelivered ? 'Delivered' : order.estimatedTime || '30–35 mins'}
              </h2>
              <p className="text-xs text-[#D1C9BE] mt-0.5 truncate max-w-[280px]">
                {order.status === 'out_for_delivery'
                  ? 'Delivery partner is on the way to your house'
                  : order.status === 'preparing'
                  ? 'Chefs are cooking your meal in the kitchen'
                  : order.status === 'ready'
                  ? 'Packed and ready for delivery partner'
                  : 'Order confirmed and scheduled'}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#E5C07B]">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E1D5] shadow-xs mb-5">
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-5">
            Order Progress
          </h3>

          <div className="relative pl-6 space-y-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E6E1D5]">
            {(order.timeline || []).map((step: any, idx: number) => {
              const Icon = getStatusIcon(step.status);
              const isCompleted = step.completed;
              const isCurrent = step.current;

              return (
                <div key={idx} className="relative flex items-start gap-3.5 text-left">
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-[#C99A4A] border-[#C99A4A] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-white border-[#C99A4A] text-[#C99A4A] animate-pulse ring-4 ring-[#C99A4A]/20'
                        : 'bg-white border-[#D1C9BE] text-[#D1C9BE]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          isCompleted || isCurrent ? 'text-[#1A1814]' : 'text-[#77736C]'
                        }`}
                      >
                        {step.title}
                      </h4>
                      {step.time && (
                        <span className="text-[11px] text-[#77736C]">
                          {step.time}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#77736C] mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Delivery Partner Card */}
        {!isPickup && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs mb-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FBF6EE] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A]">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#1A1814]">
                    {order.deliveryPersonName || 'Grand View Delivery Partner'}
                  </h4>
                  <p className="text-[11px] text-[#77736C]">
                    {order.deliveryPersonName ? 'Assigned Delivery Partner' : 'Assigning driver upon dispatch'}
                  </p>
                </div>
              </div>

              {order.deliveryPersonPhone && (
                <a
                  href={`tel:${order.deliveryPersonPhone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C99A4A] text-xs font-semibold text-[#C99A4A] hover:bg-[#C99A4A] hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Partner</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Delivery Address Details */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs mb-5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#C99A4A] font-bold text-xs uppercase tracking-wider mb-1">
            <Home className="w-4 h-4" />
            <span>{isPickup ? 'Pickup Location' : 'Delivery Destination'}</span>
          </div>

          {isPickup ? (
            <p className="font-medium text-[#1A1814]">
              Front Counter Pickup at Grand View Restaurant
            </p>
          ) : (
            <div className="space-y-1 text-[#1A1814]">
              <p className="font-bold text-sm">
                {order.houseName || order.deliveryAddress}
              </p>
              <p className="text-[#77736C]">
                {order.locality && `${order.locality}, `}
                {order.island && `${order.island} Island`}
              </p>
              {order.landmark && (
                <p className="text-[#77736C]">
                  <span className="font-semibold text-[#1A1814]">Landmark:</span> {order.landmark}
                </p>
              )}
              {order.deliveryInstructions && (
                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg mt-1 font-medium text-[11px]">
                  Instructions: {order.deliveryInstructions}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Ordered Items Summary */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-3">
          <h3 className="font-serif text-sm font-bold text-[#1A1814]">
            Order Details ({order.items?.length || 0} items)
          </h3>

          <div className="divide-y divide-[#E6E1D5]/60 text-xs">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1A1814]">{item.quantity}×</span>{' '}
                  <span className="font-medium text-[#1A1814]">{item.foodItem?.name || item.name}</span>
                  {item.selectedAddOns?.length > 0 && (
                    <p className="text-[10px] text-[#77736C]">
                      + {item.selectedAddOns.map((a: any) => a.name).join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-semibold text-[#1A1814]">
                  ₹{item.itemTotal || ((item.foodItem?.price || item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E6E1D5] space-y-1 text-xs text-[#77736C]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#1A1814] pt-1">
              <span>Total Bill</span>
              <span className="text-[#C99A4A]">₹{order.total}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
