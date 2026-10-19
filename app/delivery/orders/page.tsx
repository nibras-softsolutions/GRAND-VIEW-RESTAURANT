'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  ArrowLeft,
} from 'lucide-react';

function DeliveryOrdersList() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'active';

  const [filter, setFilter] = useState<'active' | 'completed'>(
    initialFilter === 'completed' ? 'completed' : 'active'
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (currentFilter: 'active' | 'completed') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/delivery/orders?filter=${currentFilter}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/delivery"
            className="p-1.5 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-xl font-bold text-[#1A1814]">
            {filter === 'completed' ? 'Completed Deliveries' : 'Active Deliveries'}
          </h1>
        </div>

        <button
          onClick={() => fetchOrders(filter)}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-[#E6E1D5] text-[#77736C] hover:text-[#1A1814] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C99A4A]' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-[#EBE7DF] rounded-xl text-xs font-semibold">
        <button
          onClick={() => setFilter('active')}
          className={`py-2 rounded-lg transition-all ${
            filter === 'active'
              ? 'bg-white text-[#1A1814] shadow-xs'
              : 'text-[#77736C] hover:text-[#1A1814]'
          }`}
        >
          Active Tasks
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`py-2 rounded-lg transition-all ${
            filter === 'completed'
              ? 'bg-white text-[#1A1814] shadow-xs'
              : 'text-[#77736C] hover:text-[#1A1814]'
          }`}
        >
          Completed History
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 border border-[#E6E1D5] text-center">
          <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#77736C]">Loading deliveries...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-[#E6E1D5] text-center space-y-2">
          <Package className="w-8 h-8 text-[#A0988C] mx-auto mb-1" />
          <p className="font-serif text-sm font-bold text-[#1A1814]">
            {filter === 'completed' ? 'No completed deliveries yet today' : 'No active deliveries assigned'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/delivery/orders/${encodeURIComponent(order.id)}`}
              className="block bg-white rounded-2xl p-4 border border-[#E6E1D5] shadow-xs hover:border-[#C99A4A] transition-all text-left space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-[#C99A4A]">
                    {order.id}
                  </span>
                  <h3 className="font-bold text-sm text-[#1A1814]">{order.customerName}</h3>
                </div>

                <div className="text-right">
                  <span className="font-serif text-base font-bold text-[#1A1814]">
                    ₹{order.total}
                  </span>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.status === 'out_for_delivery'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#77736C]">
                <p className="font-medium text-[#1A1814]">
                  {order.houseName || 'House'}, {order.locality || 'Locality'} ({order.island || 'Amini'})
                </p>
                <p className="text-[11px] mt-0.5">
                  {order.items.length} items • {order.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 'Prepaid Online'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DeliveryOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#77736C]">Loading...</div>}>
      <DeliveryOrdersList />
    </Suspense>
  );
}
