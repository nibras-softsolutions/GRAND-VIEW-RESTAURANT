'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Home,
  MapPin,
  Clock,
  CheckCircle2,
  Bike,
  AlertCircle,
  FileText,
  CreditCard,
  Banknote,
} from 'lucide-react';

interface DeliveryOrderDetailProps {
  params: Promise<{ id: string }>;
}

export default function DeliveryOrderDetailPage({ params }: DeliveryOrderDetailProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const rawId = decodeURIComponent(resolvedParams.id);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/delivery/orders/${encodeURIComponent(rawId)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load order.');
        setLoading(false);
        return;
      }

      setOrder(data.order);
    } catch {
      setError('Connection failed. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [rawId]);

  const handleAction = async (action: 'start_delivery' | 'mark_delivered') => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/delivery/orders/${encodeURIComponent(rawId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        await fetchOrder();
      }
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-[#E6E1D5] text-center my-6">
        <div className="w-7 h-7 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#77736C]">Loading delivery details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-red-200 text-center my-6 space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h2 className="font-serif text-lg font-bold text-[#1A1814]">Access Denied or Not Found</h2>
        <p className="text-xs text-[#77736C] max-w-xs mx-auto">
          {error || 'This order does not exist or is not assigned to your account.'}
        </p>
        <Link
          href="/delivery"
          className="inline-flex py-2 px-4 rounded-xl bg-[#1A1814] text-white text-xs font-semibold"
        >
          Back to Deliveries
        </Link>
      </div>
    );
  }

  const isDelivered = order.status === 'delivered';
  const isOutForDelivery = order.status === 'out_for_delivery';

  return (
    <div className="space-y-4 text-left pb-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/delivery"
          className="p-1.5 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-white transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-medium">Deliveries</span>
        </Link>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isDelivered
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isOutForDelivery
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#C99A4A]">
            Delivery Order
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#1A1814]">{order.id}</h1>
          <p className="text-xs text-[#77736C]">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        {/* Customer & Call Button */}
        <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E6E1D5] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Customer
            </p>
            <p className="font-bold text-sm text-[#1A1814]">{order.customerName}</p>
            <p className="text-xs text-[#77736C]">{order.phone}</p>
          </div>

          <a
            href={`tel:${order.phone.replace(/[^0-9+]/g, '')}`}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call Customer</span>
          </a>
        </div>
      </div>

      {/* Local Lakshadweep Delivery Address */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#C99A4A] border-b border-[#E6E1D5]/60 pb-2.5">
          <Home className="w-4 h-4" />
          <h2 className="font-serif text-sm font-bold text-[#1A1814]">
            Delivery House & Location Details
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E6E1D5]">
              <span className="text-[10px] text-[#77736C] uppercase font-bold block">
                Island
              </span>
              <span className="font-bold text-[#1A1814] text-sm">
                {order.island || 'Amini'}
              </span>
            </div>

            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E6E1D5]">
              <span className="text-[10px] text-[#77736C] uppercase font-bold block">
                Locality / Area
              </span>
              <span className="font-bold text-[#1A1814] text-sm">
                {order.locality || 'Locality'}
              </span>
            </div>
          </div>

          <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E6E1D5]">
            <span className="text-[10px] text-[#77736C] uppercase font-bold block">
              House Name / Number
            </span>
            <span className="font-bold text-[#1A1814] text-sm">
              {order.houseName || order.deliveryAddress}
            </span>
          </div>

          {order.landmark && (
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E6E1D5]">
              <span className="text-[10px] text-[#77736C] uppercase font-bold block">
                Landmark
              </span>
              <span className="text-[#1A1814] font-medium">{order.landmark}</span>
            </div>
          )}

          {order.deliveryInstructions && (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
              <span className="text-[10px] uppercase font-bold block text-amber-800 mb-0.5">
                Special Delivery Instructions
              </span>
              <span className="text-xs font-semibold">{order.deliveryInstructions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ordered Items Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3">
        <h2 className="font-serif text-sm font-bold text-[#1A1814] border-b border-[#E6E1D5]/60 pb-2.5">
          Order Items ({order.items.length})
        </h2>

        <div className="divide-y divide-[#E6E1D5]/50">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="py-2.5 flex items-start justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-[#1A1814]">
                  {item.quantity}× {item.foodItem?.name || item.name}
                </p>
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-[11px] text-[#77736C]">
                    + {item.selectedAddOns.map((a: any) => a.name).join(', ')}
                  </p>
                )}
              </div>
              <span className="font-medium text-[#1A1814]">
                ₹{item.itemTotal || (item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Payment Summary */}
        <div className="pt-3 border-t border-[#E6E1D5] space-y-1 text-xs">
          <div className="flex justify-between text-[#77736C]">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-[#77736C]">
            <span>Delivery Fee</span>
            <span>₹{order.deliveryCharge}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-[#1A1814] pt-1">
            <span>Total Bill</span>
            <span className="text-[#C99A4A]">₹{order.total}</span>
          </div>
        </div>

        {/* Payment Collection Callout */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between text-amber-900 font-medium">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-amber-700" />
            <span>
              {order.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 'Prepaid Online'}
            </span>
          </div>
          <span className="font-bold text-sm">
            {order.paymentMethod === 'cash-on-delivery' ? `Collect ₹${order.total}` : 'Paid In Full'}
          </span>
        </div>
      </div>

      {/* Action Footer Button */}
      <div className="sticky bottom-18 left-0 right-0 pt-2">
        {isDelivered ? (
          <div className="w-full py-4 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>This Order Has Been Delivered</span>
          </div>
        ) : !isOutForDelivery ? (
          <button
            onClick={() => handleAction('start_delivery')}
            disabled={actionLoading}
            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            {actionLoading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Bike className="w-5 h-5" />
                <span>Start Delivery Now</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => handleAction('mark_delivered')}
            disabled={actionLoading}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            {actionLoading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Mark as Successfully Delivered</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
