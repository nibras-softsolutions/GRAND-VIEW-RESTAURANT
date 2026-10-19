'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Bike,
  Lock,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

export default function DeliveryProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/delivery/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.profile) {
          setProfile(data.profile);
          setName(data.profile.name || '');
          setPhone(data.profile.phone || '');
          setVehicleInfo(data.profile.vehicle_info || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const payload: any = { name, phone: phone.trim(), vehicle_info: vehicleInfo };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await fetch('/api/delivery/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Failed to update profile.', type: 'error' });
      } else {
        setMessage({ text: 'Profile updated successfully.', type: 'success' });
        if (data.profile) {
          setProfile(data.profile);
          setName(data.profile.name || '');
          setPhone(data.profile.phone || '');
          setVehicleInfo(data.profile.vehicle_info || '');
        }
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/delivery/auth/logout', { method: 'POST' });
    router.push('/delivery/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-[#E6E1D5] text-center my-6">
        <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-[#77736C]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#C99A4A]/10 border border-[#C99A4A]/30 flex items-center justify-center text-[#C99A4A]">
          <Bike className="w-7 h-7" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#C99A4A]">
            Active Delivery Partner
          </span>
          <h1 className="font-serif text-xl font-bold text-[#1A1814]">{profile?.name}</h1>
          <p className="text-xs text-[#77736C]">{profile?.phone}</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Edit Info Form */}
      <form onSubmit={handleUpdate} className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-4">
        <h2 className="font-serif text-sm font-bold text-[#1A1814] border-b border-[#E6E1D5]/60 pb-2.5">
          Delivery Details
        </h2>

        <div>
          <label className="block text-xs font-semibold text-[#1A1814] mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E1D5] text-xs text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1A1814] mb-1">
            Mobile Number (Login & Delivery Contact)
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736C]" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 94471 23456"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E1D5] text-xs text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
            />
          </div>
          <p className="text-[10px] text-[#77736C] mt-1">
            Used to sign in to the delivery portal and coordinate orders with customers.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1A1814] mb-1">
            Vehicle Details (e.g. Bike Model & Plate)
          </label>
          <input
            type="text"
            value={vehicleInfo}
            onChange={(e) => setVehicleInfo(e.target.value)}
            placeholder="Honda Activa (LD-01-A-1234)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E1D5] text-xs text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
          />
        </div>

        <div className="pt-2 border-t border-[#E6E1D5]/60 space-y-3">
          <h3 className="text-xs font-bold text-[#1A1814]">Change Password</h3>

          <div>
            <label className="block text-[11px] text-[#77736C] mb-1">
              Current Password (required only if setting new password)
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#E6E1D5] text-xs text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#77736C] mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#E6E1D5] text-xs text-[#1A1814] focus:outline-none focus:border-[#C99A4A]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 rounded-xl bg-[#1A1814] hover:bg-[#C99A4A] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          {saving ? 'Saving...' : 'Update Details'}
        </button>
      </form>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 px-4 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of Delivery Portal</span>
      </button>
    </div>
  );
}
