'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Bike,
  Store,
  CreditCard,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { OrderStatus } from '@/types';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const rawId = decodeURIComponent(resolvedParams.id);
  const router = useRouter();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(rawId)}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (e) {
      console.error('Failed to load order', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [rawId]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(rawId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrderDetail();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      }
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#77736C]">
        <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading order {rawId}...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E6E1D5] text-center max-w-md mx-auto">
        <h3 className="font-serif text-lg font-bold text-[#1A1814] mb-2">Order Not Found</h3>
        <p className="text-xs text-[#77736C] mb-4">The order {rawId} could not be retrieved from the database.</p>
        <Link href="/admin/orders" className="btn-gold py-2 px-4 text-xs font-semibold inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isPickup = order.orderType === 'pickup';

  // Determine available next step in workflow
  const getNextStep = (status: string) => {
    if (status === 'confirmed') return { label: 'Mark as Preparing in Kitchen', next: 'preparing' };
    if (status === 'preparing') {
      return isPickup
        ? { label: 'Mark Ready for Counter Pickup', next: 'ready_for_pickup' }
        : { label: 'Hand Over to Valet (Out for Delivery)', next: 'out_for_delivery' };
    }
    if (status === 'out_for_delivery' || status === 'ready_for_pickup') {
      return { label: isPickup ? 'Mark as Picked Up' : 'Mark as Delivered', next: 'delivered' };
    }
    return null;
  };

  const nextAction = getNextStep(order.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 -ml-2 rounded-xl text-[#1A1814] hover:bg-white transition-colors border border-transparent hover:border-[#E6E1D5]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-2xl font-bold text-[#1A1814]">
                {order.id}
              </h2>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-[#77736C] mt-0.5">
              Created {order.createdAt} • Type: <span className="capitalize font-semibold">{order.orderType || 'delivery'}</span>
            </p>
          </div>
        </div>

        {/* Workflow Advance Button */}
        {nextAction && (
          <button
            type="button"
            disabled={updating}
            onClick={() => handleStatusChange(nextAction.next as OrderStatus)}
            className="btn-gold py-2.5 px-5 text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#C99A4A]/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{nextAction.label}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Line Items & Pricing */}
        <div className="lg:col-span-8 space-y-6">
          {/* Ordered Dishes Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E1D5] shadow-xs">
            <h3 className="font-serif text-base font-bold text-[#1A1814] mb-4">
              Ordered Items ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-[#E6E1D5]/70">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.foodItem?.image && (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#1D1B18] shrink-0 border border-[#E6E1D5]">
                        <Image
                          src={item.foodItem.image}
                          alt={item.foodItem.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#1A1814] text-sm">
                        {item.foodItem?.name || 'Dish'}
                      </p>
                      <p className="text-xs text-[#77736C]">
                        ₹{item.foodItem?.price} × {item.quantity}
                      </p>
                      {item.selectedAddOns?.length > 0 && (
                        <p className="text-[11px] text-[#C99A4A] mt-0.5">
                          + {item.selectedAddOns.map((a: any) => `${a.name} (₹${a.price})`).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="font-bold text-sm text-[#1A1814]">
                    ₹{item.itemTotal}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Calculation */}
            <div className="mt-5 pt-4 border-t border-[#E6E1D5] space-y-2 text-xs">
              <div className="flex justify-between text-[#77736C]">
                <span>Subtotal</span>
                <span className="font-medium text-[#1A1814]">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-[#77736C]">
                <span>Delivery Charge</span>
                <span className="font-medium text-[#1A1814]">₹{order.deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-[#77736C]">
                <span>GST Tax (5%)</span>
                <span className="font-medium text-[#1A1814]">₹{order.tax}</span>
              </div>
              <div className="border-t border-[#E6E1D5] pt-2 flex justify-between text-base font-bold text-[#1A1814]">
                <span>Total Amount</span>
                <span className="text-[#C99A4A]">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Timeline History */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E1D5] shadow-xs">
            <h3 className="font-serif text-base font-bold text-[#1A1814] mb-4">
              Status Progression Timeline
            </h3>

            <div className="space-y-4">
              {order.timeline?.map((step: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      step.completed
                        ? 'bg-[#C99A4A] text-white'
                        : step.current
                        ? 'bg-amber-100 text-amber-700 border-2 border-[#C99A4A]'
                        : 'bg-[#FAF8F5] text-[#A0988C] border border-[#E6E1D5]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-[#1A1814]">{step.title}</p>
                      {step.time && <span className="text-[11px] text-[#77736C]">{step.time}</span>}
                    </div>
                    <p className="text-[11px] text-[#77736C] mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Information */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#1A1814]">
              Customer Information
            </h4>
            <div className="text-xs space-y-2">
              <p className="font-bold text-sm text-[#1A1814]">{order.customerName}</p>
              <a
                href={`tel:${order.phone}`}
                className="flex items-center gap-2 text-[#C99A4A] hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{order.phone}</span>
              </a>
              {order.email && (
                <p className="flex items-center gap-2 text-[#77736C]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{order.email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#1A1814]">
              {isPickup ? 'Pickup Location' : 'Delivery Destination'}
            </h4>
            <div className="text-xs space-y-1.5 text-[#1A1814]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C99A4A] shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">
                  {order.deliveryAddress || 'Grand View Restaurant Counter'}
                </p>
              </div>
              {order.landmark && (
                <p className="text-[11px] text-[#77736C] pl-6">
                  Landmark: {order.landmark}
                </p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#1A1814]">
              Payment Details
            </h4>
            <div className="text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#1A1814]">
                <CreditCard className="w-3.5 h-3.5 text-[#C99A4A]" />
                <span className="font-semibold capitalize">
                  {order.paymentMethod?.replace(/-/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-[#77736C]">
                Total Paid / Due: <span className="font-bold text-[#1A1814]">₹{order.total}</span>
              </p>
            </div>
          </div>

          {/* Manual Status Override */}
          <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E6E1D5] space-y-2">
            <p className="text-xs font-bold text-[#1A1814]">Manual Status Override</p>
            <p className="text-[11px] text-[#77736C]">Change status directly if needed:</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['confirmed', 'preparing', isPickup ? 'ready_for_pickup' : 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st as OrderStatus)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                    order.status === st
                      ? 'bg-[#1D1B18] text-white'
                      : 'bg-white border border-[#E6E1D5] text-[#77736C] hover:text-[#1A1814]'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
