'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  ShoppingBag,
  IndianRupee,
  Calendar,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data?.customers) {
        setCustomers(data.customers);
      }
    } catch (e) {
      console.error('Failed to load customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1814]">
            Customer Directory
          </h2>
          <p className="text-xs text-[#77736C]">
            Verified customer profiles and lifetime spending calculated from live orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E6E1D5] text-xs text-[#1A1814] placeholder-[#77736C] focus:outline-hidden focus:border-[#C99A4A]"
            />
          </form>

          <button
            onClick={fetchCustomers}
            className="p-2 rounded-xl bg-white border border-[#E6E1D5] text-[#77736C] hover:text-[#1A1814] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C99A4A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xs overflow-hidden">
        {loading && customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading customer profiles...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            No customer records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E6E1D5] text-[#77736C] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone & Email</th>
                  <th className="py-3 px-4">Orders Placed</th>
                  <th className="py-3 px-4">Total Spending</th>
                  <th className="py-3 px-4">Last Order</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D5]/60">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1A1814]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A] font-bold uppercase text-xs">
                          {c.name ? c.name.slice(0, 2) : 'CU'}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#1A1814]">{c.phone}</p>
                      <p className="text-[11px] text-[#77736C]">{c.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E6E1D5] font-bold text-[#1A1814]">
                        {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#1A1814] text-sm">
                      ₹{c.totalSpent.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-[#77736C]">
                      {c.lastOrder}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E6E1D5] hover:border-[#C99A4A] text-xs font-semibold text-[#1A1814]"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer/Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#E6E1D5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D5]">
              <h3 className="font-serif text-lg font-bold text-[#1A1814]">
                Customer Profile
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-xs font-semibold text-[#77736C] hover:text-[#1A1814]"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Full Name</p>
                <p className="font-bold text-sm text-[#1A1814]">{selectedCustomer.name}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Phone Number</p>
                <p className="font-semibold text-[#1A1814]">{selectedCustomer.phone}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Email Address</p>
                <p className="text-[#1A1814]">{selectedCustomer.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Total Orders</p>
                  <p className="font-serif text-xl font-bold text-[#1A1814] mt-1">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Lifetime Spent</p>
                  <p className="font-serif text-xl font-bold text-[#C99A4A] mt-1">₹{selectedCustomer.totalSpent}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
