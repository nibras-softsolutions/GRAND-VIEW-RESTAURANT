'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Clock,
  Bike,
  ShieldCheck,
  AlertCircle,
  Save,
  Plus,
  Users,
  Lock,
  Mail,
  User,
  CheckCircle2,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'restaurant' | 'ordering' | 'admins'>('restaurant');
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // General Settings State
  const [name, setName] = useState('Alfiya Kitchen');
  const [tagline, setTagline] = useState('Good Food. Great Moments.');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('dine@alfiyakitchen.com');
  const [address, setAddress] = useState('Marine Promenade, Waterfront Road, Kochi, Kerala 682001');
  const [openHours, setOpenHours] = useState('11:00 AM – 11:30 PM');
  const [isOpen, setIsOpen] = useState(true);
  const [closureNotice, setClosureNotice] = useState('We are currently closed. We will accept orders again at 11:00 AM.');

  // Ordering Settings State
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState('40');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('500');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('150');
  const [deliveryTimeEstimate, setDeliveryTimeEstimate] = useState('30–35 mins');
  const [pickupTimeEstimate, setPickupTimeEstimate] = useState('15–20 mins');

  // Admin users state (Super admin only)
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'manager' | 'staff'>('staff');

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current admin user
    fetch('/api/admin/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    // Fetch settings
    fetch('/api/admin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.general) {
          setName(data.general.name || 'Alfiya Kitchen');
          setTagline(data.general.tagline || 'Good Food. Great Moments.');
          setPhone(data.general.phone || '+91 98765 43210');
          setEmail(data.general.email || 'dine@alfiyakitchen.com');
          setAddress(data.general.address || 'Marine Promenade, Kochi');
          setOpenHours(data.general.openHours || '11:00 AM – 11:30 PM');
          setIsOpen(data.general.isOpen !== false);
          setClosureNotice(data.general.closureNotice || '');
        }

        if (data?.ordering) {
          setDeliveryEnabled(data.ordering.deliveryEnabled !== false);
          setPickupEnabled(data.ordering.pickupEnabled !== false);
          setStandardDeliveryFee(String(data.ordering.standardDeliveryFee ?? 40));
          setFreeDeliveryThreshold(String(data.ordering.freeDeliveryThreshold ?? 500));
          setMinimumOrderAmount(String(data.ordering.minimumOrderAmount ?? 150));
          setDeliveryTimeEstimate(data.ordering.deliveryTimeEstimate || '30–35 mins');
          setPickupTimeEstimate(data.ordering.pickupTimeEstimate || '15–20 mins');
        }
      })
      .catch(() => {});

    // Fetch admin accounts
    fetch('/api/admin/users')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.users) setAdminUsers(data.users);
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          general: {
            name,
            tagline,
            phone,
            email,
            address,
            openHours,
            isOpen,
            closureNotice,
          },
          ordering: {
            deliveryEnabled,
            pickupEnabled,
            standardDeliveryFee: Number(standardDeliveryFee) || 40,
            freeDeliveryThreshold: Number(freeDeliveryThreshold) || 500,
            minimumOrderAmount: Number(minimumOrderAmount) || 150,
            deliveryTimeEstimate,
            pickupTimeEstimate,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to update settings');
      } else {
        setStatusMessage('Restaurant settings updated successfully in database.');
      }
    } catch (err) {
      setErrorMessage('Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          role: newAdminRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create admin');
        return;
      }

      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setStatusMessage('New administrator created successfully.');

      // Refresh list
      const refetch = await fetch('/api/admin/users');
      const refetchData = await refetch.json();
      if (refetchData?.users) setAdminUsers(refetchData.users);
    } catch (e) {
      setErrorMessage('Error creating administrator');
    }
  };

  const handleToggleAdminStatus = async (id: string, current: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !current }),
      });

      if (res.ok) {
        setAdminUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, active: !current } : u))
        );
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1A1814]">
          Restaurant Settings & Configuration
        </h2>
        <p className="text-xs text-[#77736C]">
          Configure operating hours, delivery fees, master store status, and team access.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E1D5] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('restaurant')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'restaurant'
              ? 'bg-[#1D1B18] text-white shadow-xs'
              : 'text-[#77736C] hover:text-[#1A1814]'
          }`}
        >
          General & Hours
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ordering')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ordering'
              ? 'bg-[#1D1B18] text-white shadow-xs'
              : 'text-[#77736C] hover:text-[#1A1814]'
          }`}
        >
          Ordering & Delivery Rules
        </button>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'admins'
                ? 'bg-[#1D1B18] text-white shadow-xs'
                : 'text-[#77736C] hover:text-[#1A1814]'
            }`}
          >
            Team & Admin Roles
          </button>
        )}
      </div>

      {/* Tab 1: General & Hours */}
      {activeTab === 'restaurant' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6E1D5] shadow-xs space-y-6">
          {/* Master Store Status */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm text-[#1A1814]">Accepting Customer Orders</p>
              <p className="text-xs text-[#77736C]">
                Turn off to temporarily pause incoming orders across customer website
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                isOpen
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-red-600 text-white shadow-sm'
              }`}
            >
              {isOpen ? '● Store Open' : '○ Store Closed'}
            </button>
          </div>

          {!isOpen && (
            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Notice Displayed to Customers when Closed
              </label>
              <input
                type="text"
                value={closureNotice}
                onChange={(e) => setClosureNotice(e.target.value)}
                placeholder="We are currently closed. We will accept orders again at 11:00 AM."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={openHours}
                onChange={(e) => setOpenHours(e.target.value)}
                placeholder="11:00 AM – 11:30 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E1D5] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-gold py-2.5 px-6 text-xs font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save General Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Ordering Rules */}
      {activeTab === 'ordering' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6E1D5] shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="p-4 rounded-xl border border-[#E6E1D5] flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryEnabled}
                onChange={(e) => setDeliveryEnabled(e.target.checked)}
                className="w-4 h-4 text-[#C99A4A]"
              />
              <div>
                <p className="font-bold text-xs text-[#1A1814]">Enable Doorstep Delivery</p>
                <p className="text-[11px] text-[#77736C]">Customers can choose home delivery</p>
              </div>
            </label>

            <label className="p-4 rounded-xl border border-[#E6E1D5] flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pickupEnabled}
                onChange={(e) => setPickupEnabled(e.target.checked)}
                className="w-4 h-4 text-[#C99A4A]"
              />
              <div>
                <p className="font-bold text-xs text-[#1A1814]">Enable Takeaway Counter Pickup</p>
                <p className="text-[11px] text-[#77736C]">Customers can collect directly</p>
              </div>
            </label>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                value={standardDeliveryFee}
                onChange={(e) => setStandardDeliveryFee(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Free Delivery Order Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
              <p className="text-[10px] text-[#77736C] mt-1">Orders above this receive free delivery</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Estimated Delivery Window
              </label>
              <input
                type="text"
                value={deliveryTimeEstimate}
                onChange={(e) => setDeliveryTimeEstimate(e.target.value)}
                placeholder="30–35 mins"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E1D5] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-gold py-2.5 px-6 text-xs font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Ordering Rules'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Admin Accounts (Super Admin) */}
      {activeTab === 'admins' && isSuperAdmin && (
        <div className="space-y-6">
          {/* Create New Admin */}
          <form onSubmit={handleCreateAdmin} className="bg-white rounded-2xl p-6 border border-[#E6E1D5] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1A1814]">
              Create Administrator Account
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#E6E1D5] text-xs"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#E6E1D5] text-xs"
              />
              <input
                type="password"
                required
                placeholder="Password (min 8 chars)"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#E6E1D5] text-xs"
              />
              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value as any)}
                className="px-3.5 py-2 rounded-xl border border-[#E6E1D5] text-xs font-semibold"
              >
                <option value="manager">Manager</option>
                <option value="staff">Kitchen/Delivery Staff</option>
              </select>
            </div>

            <button type="submit" className="btn-gold py-2 px-5 text-xs font-semibold inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </form>

          {/* Existing Admins List */}
          <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E6E1D5]">
              <h4 className="font-serif text-sm font-bold text-[#1A1814]">
                Active Administrators
              </h4>
            </div>

            <div className="divide-y divide-[#E6E1D5]/60 text-xs">
              {adminUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1A1814]">{user.name}</p>
                    <p className="text-[11px] text-[#77736C]">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] border border-[#E6E1D5] text-[#1A1814]">
                      {user.role?.replace('_', ' ')}
                    </span>

                    {user.id !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => handleToggleAdminStatus(user.id, user.active)}
                        className={`text-xs font-semibold ${
                          user.active ? 'text-red-600 hover:underline' : 'text-emerald-600 hover:underline'
                        }`}
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
