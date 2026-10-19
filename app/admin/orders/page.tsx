'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Clock,
  ArrowRight,
  Bike,
  Store,
  RefreshCw,
  Eye,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { OrderStatus } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all'
        ? `/api/admin/orders?limit=100&search=${encodeURIComponent(searchQuery)}`
        : `/api/admin/orders?limit=100&status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Failed to fetch admin orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleQuickStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        const err = await res.json();
        alert(err.error || 'Status transition error');
      }
    } catch (e) {
      console.error('Failed to change status', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse';
      case 'confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'ready':
      case 'ready_for_pickup':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'out_for_delivery':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const filterTabs = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Ready', value: 'ready' },
    { label: 'Out for Delivery', value: 'out_for_delivery' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <div className="space-y-5 text-left">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C99A4A]">
            Operations
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1814] mt-0.5">
            Order Management
          </h2>
          <p className="text-xs text-[#77736C]">
            View, track, and assign orders to delivery drivers across Lakshadweep.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, customer, phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E6E1D5] text-xs text-[#1A1814] placeholder-[#77736C] focus:outline-none focus:border-[#C99A4A]"
            />
          </form>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-white border border-[#E6E1D5] text-[#77736C] hover:text-[#1A1814] transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C99A4A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-[#1D1B18] text-white'
                : 'bg-white border border-[#E6E1D5] text-[#77736C] hover:text-[#1A1814]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading orders from database...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C] space-y-1">
            <p className="font-serif text-base font-bold text-[#1A1814]">No Orders Found</p>
            <p>No orders currently match the selected status or search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E6E1D5] text-[#77736C] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer & Location</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Assigned Partner</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status & Quick Action</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D5]/60">
                {orders.map((order) => {
                  const isPickup = order.orderType === 'pickup';
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 px-4 font-bold text-[#1A1814] align-top">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(order.id)}`}
                          className="hover:text-[#C99A4A] underline-offset-2 hover:underline"
                        >
                          {order.id}
                        </Link>
                        <p className="text-[10px] text-[#77736C] font-normal mt-0.5">
                          {order.createdAt}
                        </p>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-semibold text-[#1A1814]">{order.customerName}</p>
                        <p className="text-[11px] text-[#77736C]">{order.phone}</p>
                        {!isPickup && (
                          <p className="text-[10px] text-[#C99A4A] font-medium mt-0.5">
                            {order.houseName || order.deliveryAddress} • {order.island || 'Amini'}
                          </p>
                        )}
                      </td>

                      {/* Order Type */}
                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            isPickup
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isPickup ? <Store className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                          <span>{order.orderType || 'delivery'}</span>
                        </span>
                      </td>

                      {/* Assigned Delivery Partner */}
                      <td className="py-3.5 px-4 align-top">
                        {isPickup ? (
                          <span className="text-[11px] text-[#77736C]">Front Counter</span>
                        ) : order.deliveryPersonName ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#1A1814] font-medium">
                            <Bike className="w-3.5 h-3.5 text-[#C99A4A]" />
                            <span>{order.deliveryPersonName}</span>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-bold text-[#1A1814] text-sm">₹{order.total}</p>
                        <p className="text-[10px] text-[#77736C] uppercase tracking-wide">
                          {order.paymentMethod?.replace(/-/g, ' ')}
                        </p>
                      </td>

                      {/* Status Transition Control */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status.replace(/_/g, ' ')}
                          </span>

                          {order.status !== 'delivered' && order.status !== 'rejected' && order.status !== 'cancelled' && (
                            <div>
                              <select
                                disabled={isUpdating}
                                value={order.status}
                                onChange={(e) =>
                                  handleQuickStatusChange(order.id, e.target.value as OrderStatus)
                                }
                                className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-[#FAF8F5] border border-[#E6E1D5] text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready for Dispatch</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="rejected">Reject Order</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right align-top">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(order.id)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1D5] hover:border-[#C99A4A] text-xs font-semibold text-[#1A1814] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
