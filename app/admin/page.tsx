'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  UtensilsCrossed,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface MetricData {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [unavailableItems, setUnavailableItems] = useState<any[]>([]);
  const [salesChart, setSalesChart] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d'>('7d');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/orders?limit=6'),
      ]);

      const analyticsData = await analyticsRes.json();
      const ordersData = await ordersRes.json();

      if (analyticsData.metrics) {
        setMetrics(analyticsData.metrics);
        setPopularItems(analyticsData.popularItems || []);
        setUnavailableItems(analyticsData.unavailableItems || []);
        setSalesChart(analyticsData.salesChart || []);
      }

      if (ordersData.orders) {
        setRecentOrders(ordersData.orders);
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleItemAvailability = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !current }),
      });
      fetchDashboardData();
    } catch (e) {
      console.error('Failed to toggle availability', e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse';
      case 'out_for_delivery':
      case 'ready_for_pickup':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const maxChartRev = Math.max(...(salesChart.map((d) => d.revenue) || [1000]), 1000);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1814]">
            Restaurant Operations Overview
          </h2>
          <p className="text-xs text-[#77736C]">
            Live real-time feed from Neon PostgreSQL database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 rounded-xl border border-[#E6E1D5] text-[#77736C] hover:text-[#1A1814] hover:bg-[#FAF8F5] transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C99A4A]' : ''}`} />
          </button>
          <Link
            href="/admin/orders"
            className="btn-gold py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. Overview 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-[#77736C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
            {loading ? '...' : metrics?.todayOrders || 0}
          </p>
          <p className="text-[11px] text-[#77736C] mt-1">
            Total lifetime: {metrics?.totalOrders || 0}
          </p>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-[#77736C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
            ₹{loading ? '...' : (metrics?.todayRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#77736C] mt-1">
            Total sales: ₹{(metrics?.totalRevenue || 0).toLocaleString()}
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-[#77736C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
            {loading ? '...' : metrics?.pendingOrders || 0}
          </p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Kitchen & Delivery queue
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-[#77736C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
            {loading ? '...' : metrics?.totalCustomers || 0}
          </p>
          <p className="text-[11px] text-[#77736C] mt-1">
            AOV: ₹{metrics?.averageOrderValue || 0}
          </p>
        </div>
      </div>

      {/* 2. Sales Overview Chart & Popular Items (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif text-base font-bold text-[#1A1814]">
                Sales Overview
              </h3>
              <p className="text-xs text-[#77736C]">Daily revenue & order volume</p>
            </div>

            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E6E1D5] text-xs">
              <button
                type="button"
                onClick={() => setTimeframe('today')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  timeframe === 'today' ? 'bg-[#C99A4A] text-white font-semibold' : 'text-[#77736C]'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('7d')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  timeframe === '7d' ? 'bg-[#C99A4A] text-white font-semibold' : 'text-[#77736C]'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('30d')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  timeframe === '30d' ? 'bg-[#C99A4A] text-white font-semibold' : 'text-[#77736C]'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 pt-6 border-b border-[#E6E1D5]">
            {salesChart.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#77736C]">
                No historical sales recorded yet. New orders will appear here.
              </div>
            ) : (
              salesChart.map((d, idx) => {
                const heightPercent = Math.max(Math.round((d.revenue / maxChartRev) * 100), 8);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="text-[10px] font-bold text-[#77736C] opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{d.revenue}
                    </div>
                    <div className="w-full max-w-[36px] bg-[#FAF8F5] rounded-t-lg relative flex items-end h-36 border border-[#E6E1D5]/60">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-[#C99A4A] group-hover:bg-[#B0853D] rounded-t-lg transition-all"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[#77736C]">
                      {d.day}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#77736C]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C99A4A]" />
              Revenue (INR)
            </span>
            <span>Average Order Value: ₹{metrics?.averageOrderValue || 0}</span>
          </div>
        </div>

        {/* Popular Items Card */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-bold text-[#1A1814]">
              Top Selling Dishes
            </h3>
            <Link href="/admin/menu" className="text-xs font-semibold text-[#C99A4A] hover:underline">
              View Menu
            </Link>
          </div>

          {popularItems.length === 0 ? (
            <p className="text-xs text-[#77736C] py-8 text-center">
              Order history will rank popular items here.
            </p>
          ) : (
            <div className="divide-y divide-[#E6E1D5]/60 text-xs">
              {popularItems.map((item, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 text-center font-bold text-[#77736C]">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1A1814] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#77736C]">{item.quantity} sold</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#1A1814] shrink-0">
                    ₹{item.revenue}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Low Availability Alert */}
          {unavailableItems.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#E6E1D5]">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{unavailableItems.length} Disabled / Sold Out Dishes</span>
              </div>
              <div className="space-y-1.5">
                {unavailableItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs"
                  >
                    <span className="truncate max-w-[160px] text-[#1A1814] font-medium">
                      {item.name}
                    </span>
                    <button
                      onClick={() => handleToggleItemAvailability(item.id, false)}
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded transition-colors"
                    >
                      Enable
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E6E1D5] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-[#1A1814]">
              Recent Orders
            </h3>
            <p className="text-xs text-[#77736C]">Latest transactions from customer website</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#C99A4A] hover:underline flex items-center gap-1"
          >
            <span>All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#77736C]">
            No orders found. When customers place orders, they will show here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E6E1D5] text-[#77736C] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D5]/60">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1A1814]">
                      <Link href={`/admin/orders/${encodeURIComponent(order.id)}`} className="hover:text-[#C99A4A]">
                        {order.id}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#1A1814]">{order.customerName}</p>
                      <p className="text-[10px] text-[#77736C]">{order.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium text-[#77736C]">
                        {order.orderType || 'delivery'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1A1814]">
                      ₹{order.total}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#77736C]">
                      {order.createdAt}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${encodeURIComponent(order.id)}`}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E6E1D5] hover:border-[#C99A4A] text-xs font-semibold text-[#1A1814] transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
