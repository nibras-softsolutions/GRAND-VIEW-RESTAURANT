'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Clock,
  PieChart,
  Calendar,
  Award,
  RefreshCw,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/analytics');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-xs text-[#77736C]">
        <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Calculating restaurant metrics from database...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const statusDistribution = data?.statusDistribution || {};
  const popularItems = data?.popularItems || [];
  const salesChart = data?.salesChart || [];

  const maxChartRev = Math.max(...(salesChart.map((d: any) => d.revenue) || [1000]), 1000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1814]">
            Business Analytics & Revenue
          </h2>
          <p className="text-xs text-[#77736C]">
            Audited financial data computed from verified database transactions.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="btn-gold py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#77736C]">Lifetime Revenue</p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814] mt-1">
            ₹{(metrics.totalRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#77736C] mt-1">From {metrics.totalOrders || 0} customer orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#77736C]">Today&apos;s Gross</p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">
            ₹{(metrics.todayRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#77736C] mt-1">{metrics.todayOrders || 0} orders today</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#77736C]">Average Order Value</p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#C99A4A] mt-1">
            ₹{metrics.averageOrderValue || 0}
          </p>
          <p className="text-[11px] text-[#77736C] mt-1">Per transaction average</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#77736C]">Active Customer Base</p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814] mt-1">
            {metrics.totalCustomers || 0}
          </p>
          <p className="text-[11px] text-[#77736C] mt-1">Registered diners</p>
        </div>
      </div>

      {/* Sales Trajectory Chart */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-[#1A1814]">
              7-Day Revenue Velocity
            </h3>
            <p className="text-xs text-[#77736C]">Daily intake recorded in Neon PostgreSQL</p>
          </div>
        </div>

        <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-[#E6E1D5]">
          {salesChart.map((d: any, idx: number) => {
            const heightPercent = Math.max(Math.round((d.revenue / maxChartRev) * 100), 8);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[10px] font-bold text-[#77736C] opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{d.revenue}
                </span>
                <div className="w-full max-w-[44px] bg-[#FAF8F5] rounded-t-xl relative flex items-end h-40 border border-[#E6E1D5]">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-[#C99A4A] group-hover:bg-[#B0853D] rounded-t-xl transition-all"
                  />
                </div>
                <span className="text-xs font-semibold text-[#1A1814]">{d.day}</span>
                <span className="text-[10px] text-[#77736C]">{d.orders} orders</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Breakdown: Status Distribution & Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#1A1814]">
            Order Status Breakdown
          </h3>

          <div className="space-y-3 text-xs">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const numCount = Number(count) || 0;
              const totalOrders = metrics.totalOrders || 1;
              const pct = Math.round((numCount / totalOrders) * 100);

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="capitalize text-[#1A1814]">{status.replace(/_/g, ' ')}</span>
                    <span className="text-[#77736C]">
                      {numCount} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#E6E1D5]">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${
                        status === 'delivered'
                          ? 'bg-emerald-500'
                          : status === 'cancelled'
                          ? 'bg-red-500'
                          : 'bg-[#C99A4A]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Dishes */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#1A1814]">
            Top Culinary Performers
          </h3>

          {popularItems.length === 0 ? (
            <p className="text-xs text-[#77736C] py-8 text-center">
              Customer orders will populate item performance rankings.
            </p>
          ) : (
            <div className="divide-y divide-[#E6E1D5]/70 text-xs">
              {popularItems.map((item: any, idx: number) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center font-bold text-[#C99A4A] text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#1A1814]">{item.name}</p>
                      <p className="text-[11px] text-[#77736C]">{item.quantity} orders delivered</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm text-[#1A1814]">₹{item.revenue}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
