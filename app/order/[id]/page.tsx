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
  Play,
  RotateCcw,
} from 'lucide-react';

interface OrderTrackPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderTrackPage({ params }: OrderTrackPageProps) {
  const resolvedParams = use(params);
  const rawId = decodeURIComponent(resolvedParams.id);
  const { getOrderById, currentOrder, updateOrderStatus, advanceOrderSimulation } = useOrders();

  const [order, setOrder] = useState(() => {
    return getOrderById(rawId) || currentOrder || {
      id: rawId.startsWith('#') ? rawId : `#${rawId}`,
      createdAt: 'Today • Just now',
      items: [],
      subtotal: 460,
      deliveryCharge: 0,
      tax: 0,
      total: 460,
      roomNumber: 'Room 302',
      guestName: 'Alexander Wright',
      phone: '+91 98765 43210',
      paymentMethod: 'pay-at-hotel' as const,
      status: 'preparing' as OrderStatus,
      estimatedTime: '15–20 mins',
      timeline: [
        { status: 'confirmed' as OrderStatus, title: 'Order Confirmed', description: 'Received by kitchen.', completed: true, time: '8:42 PM' },
        { status: 'preparing' as OrderStatus, title: 'Preparing in Kitchen', description: 'Chefs are cooking your meal fresh.', completed: true, current: true },
        { status: 'out_for_delivery' as OrderStatus, title: 'Out for Delivery', description: 'En route to your hotel room.', completed: false },
        { status: 'delivered' as OrderStatus, title: 'Delivered', description: 'Enjoy your in-room dining.', completed: false },
      ],
    };
  });

  useEffect(() => {
    const found = getOrderById(rawId);
    if (found) {
      setOrder(found);
    }
  }, [rawId, getOrderById]);

  const handleNextStep = () => {
    advanceOrderSimulation(order.id);
    const updated = getOrderById(order.id);
    if (updated) setOrder(updated);
  };

  const handleResetStep = () => {
    updateOrderStatus(order.id, 'confirmed');
    const updated = getOrderById(order.id);
    if (updated) setOrder(updated);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return CheckCircle2;
      case 'preparing':
        return ChefHat;
      case 'out_for_delivery':
        return Bike;
      case 'delivered':
        return Sparkles;
      default:
        return Clock;
    }
  };

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
                {order.id} • {order.roomNumber}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              order.status === 'delivered'
                ? 'bg-green-100 text-green-800'
                : 'bg-[#FBF6EE] text-[#C99A4A] border border-[#E6E1D5]'
            }`}
          >
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Estimated Arrival Banner */}
        <div className="bg-[#1D1B18] text-white rounded-2xl p-5 mb-5 shadow-xs border border-[#C99A4A]/25 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B] mb-1">
                Estimated Arrival
              </p>
              <h2 className="font-serif text-2xl font-bold text-white">
                {order.status === 'delivered' ? 'Delivered' : order.estimatedTime}
              </h2>
              <p className="text-xs text-[#D1C9BE] mt-0.5">
                Delivering to {order.roomNumber} • Grand View Hotel
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#E5C07B]">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Live Timeline Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E1D5] shadow-xs mb-5">
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-5">
            Order Timeline
          </h3>

          <div className="relative pl-6 space-y-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E6E1D5]">
            {order.timeline.map((step, idx) => {
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

          {/* Interactive Demo Simulation Controls */}
          <div className="mt-7 pt-4 border-t border-[#E6E1D5] flex items-center justify-between bg-[#FAF8F5] p-3 rounded-xl">
            <div>
              <p className="text-xs font-bold text-[#1A1814]">Simulation Controls</p>
              <p className="text-[10px] text-[#77736C]">Test next status transition</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={order.status === 'delivered'}
                className="btn-gold py-1.5 px-3 text-xs inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <Play className="w-3 h-3" />
                <span>Next</span>
              </button>
              <button
                type="button"
                onClick={handleResetStep}
                className="p-1.5 rounded-lg bg-white border border-[#E6E1D5] text-[#77736C] hover:text-[#1A1814]"
                title="Reset to confirmed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Assigned Steward Info */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FBF6EE] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A]">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#1A1814]">
                  Arjun Nair
                </h4>
                <p className="text-[11px] text-[#77736C]">Room Service Steward</p>
              </div>
            </div>

            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C99A4A] text-xs font-semibold text-[#C99A4A] hover:bg-[#C99A4A] hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* Ordered Dishes Summary */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs">
            <h4 className="font-serif text-sm font-bold text-[#1A1814] mb-3">
              Items in Order
            </h4>
            <div className="divide-y divide-[#E6E1D5]/60 text-xs sm:text-sm">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {item.foodItem?.image && (
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[#E6E1D5]">
                        <Image
                          src={item.foodItem.image}
                          alt={item.foodItem.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[#1A1814]">
                        {item.foodItem?.name || 'Dish'} × {item.quantity}
                      </p>
                      {item.selectedAddOns?.length > 0 && (
                        <p className="text-[10px] text-[#77736C]">
                          + {item.selectedAddOns.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-[#1A1814]">
                    ₹{item.itemTotal}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E6E1D5] mt-3 pt-2.5 flex justify-between font-bold text-sm text-[#1A1814]">
              <span>Total Paid</span>
              <span className="text-base text-[#C99A4A]">₹{order.total}</span>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
