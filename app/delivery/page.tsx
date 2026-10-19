'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  Phone,
  Home,
  MapPin,
  Clock,
  ArrowRight,
  Bike,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface DeliveryOrder {
  id: string;
  orderType: string;
  status: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  island: string;
  houseName: string;
  locality: string;
  landmark: string;
  deliveryInstructions: string;
  paymentMethod: string;
  paymentSubOption?: string;
  total: number;
  items: any[];
  deliveryStatus: string;
  createdAt: string;
}

export default function DeliveryDashboardPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/delivery/orders?filter=active');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setActiveCount(data.activeCount || 0);
        setCompletedCount(data.completedCount || 0);
      }
    } catch (err) {
      console.error('Failed to load assigned deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Poll every 15s for new assignments
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId: string, action: 'start_delivery' | 'mark_delivered') => {
    try {
      setActionLoading(`${orderId}-${action}`);
      const res = await fetch(`/api/delivery/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats Header */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Active Tasks
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#C99A4A] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#1A1814]">{activeCount}</p>
          <p className="text-[10px] text-[#A0988C] mt-0.5">Assigned to you</p>
        </div>

        <Link
          href="/delivery/orders?filter=completed"
          className="bg-white rounded-2xl p-4 border border-[#E6E1D5] shadow-xs hover:border-[#C99A4A] transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">
              Delivered
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#1A1814]">{completedCount}</p>
          <p className="text-[10px] text-[#A0988C] mt-0.5">Completed today</p>
        </Link>
      </div>

      {/* Title & Refresh */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#1A1814]">
            Active Deliveries
          </h2>
          <p className="text-xs text-[#77736C]">Orders ready or on the way</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-[#E6E1D5] text-[#77736C] hover:text-[#1A1814] transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C99A4A]' : ''}`} />
        </button>
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-[#E6E1D5] text-center">
          <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#77736C]">Checking for assigned deliveries...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-[#E6E1D5] text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-[#1A1814]">All Caught Up!</h3>
          <p className="text-xs text-[#77736C] max-w-xs mx-auto">
            No active deliveries assigned to you right now. When the kitchen marks an order ready and assigns you, it will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders.map((order) => {
            const isOutForDelivery = order.status === 'out_for_delivery';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D5] shadow-xs space-y-3 text-left"
              >
                {/* Header: ID, Status, Amount */}
                <div className="flex items-start justify-between border-b border-[#E6E1D5]/60 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#C99A4A]">
                      {order.id}
                    </span>
                    <h3 className="font-bold text-sm text-[#1A1814] mt-0.5">
                      {order.customerName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="font-serif text-base font-bold text-[#1A1814]">
                      ₹{order.total}
                    </span>
                    <div className="mt-0.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isOutForDelivery
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isOutForDelivery ? 'Out for Delivery' : 'Ready for Pickup'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Contact & Call button */}
                <div className="flex items-center justify-between bg-[#F8F6F1] rounded-xl p-3 border border-[#E6E1D5]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#C99A4A]" />
                    <span className="text-xs font-semibold text-[#1A1814]">{order.phone}</span>
                  </div>
                  <a
                    href={`tel:${order.phone.replace(/[^0-9+]/g, '')}`}
                    className="py-1 px-3 rounded-lg bg-[#1A1814] text-white text-xs font-medium flex items-center gap-1 hover:bg-[#C99A4A] transition-colors"
                  >
                    <span>Call Customer</span>
                  </a>
                </div>

                {/* Detailed Lakshadweep Local Address */}
                <div className="bg-[#FAF9F6] rounded-xl p-3 border border-[#E6E1D5] space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[#C99A4A] font-bold text-[11px] uppercase tracking-wider">
                    <Home className="w-3.5 h-3.5" />
                    <span>Local Delivery Location</span>
                  </div>

                  <p className="font-semibold text-[#1A1814]">
                    {order.houseName || 'House / Building'}, {order.locality || 'Locality'}
                  </p>
                  <p className="text-[#77736C]">
                    Island: <span className="font-bold text-[#1A1814]">{order.island || 'Amini'}</span>
                    {order.landmark && ` • Landmark: ${order.landmark}`}
                  </p>

                  {order.deliveryInstructions && (
                    <div className="mt-2 pt-1.5 border-t border-[#E6E1D5]/60 text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg">
                      <span className="font-bold">Instructions:</span> {order.deliveryInstructions}
                    </div>
                  )}
                </div>

                {/* Ordered Items Summary */}
                <div className="text-xs text-[#77736C] space-y-1 pt-1">
                  <p className="font-semibold text-[#1A1814]">Items to deliver:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        <span className="font-bold text-[#1A1814]">{item.quantity}×</span>{' '}
                        {item.foodItem?.name || item.name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Payment Notice */}
                <div className="text-xs bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between text-amber-900">
                  <span className="font-medium">
                    {order.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 'Prepaid Online'}
                  </span>
                  <span className="font-bold">
                    {order.paymentMethod === 'cash-on-delivery' ? `Collect ₹${order.total}` : 'Paid'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Link
                    href={`/delivery/orders/${encodeURIComponent(order.id)}`}
                    className="py-2.5 px-3 rounded-xl border border-[#E6E1D5] bg-white hover:bg-[#FAF9F6] text-xs font-semibold text-[#1A1814] text-center transition-colors"
                  >
                    View Details
                  </Link>

                  {!isOutForDelivery ? (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'start_delivery')}
                      disabled={actionLoading === `${order.id}-start_delivery`}
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      {actionLoading === `${order.id}-start_delivery` ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Bike className="w-3.5 h-3.5" />
                          <span>Start Delivery</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'mark_delivered')}
                      disabled={actionLoading === `${order.id}-mark_delivered`}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      {actionLoading === `${order.id}-mark_delivered` ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Delivered</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
