'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Save,
} from 'lucide-react';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) {
          setProfile(data.profile);
          setName(data.profile.name || '');
          setEmail(data.profile.email || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to update profile');
      } else {
        setStatusMessage('Profile and security credentials updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (e) {
      setErrorMessage('Network error while updating credentials');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#77736C]">
        <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading admin profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1A1814]">
          Administrator Profile
        </h2>
        <p className="text-xs text-[#77736C]">
          Manage your credentials, name, and security password.
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

      <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6E1D5] shadow-xs space-y-6">
        {/* Profile Details */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-[#1A1814] pb-2 border-b border-[#E6E1D5]">
            Account Details
          </h3>

          <div className="flex items-center gap-4 pb-2">
            <div className="w-14 h-14 rounded-2xl bg-[#1D1B18] text-[#E5C07B] flex items-center justify-center font-bold text-lg uppercase shadow-xs">
              {name ? name.slice(0, 2) : 'GV'}
            </div>
            <div>
              <p className="font-bold text-base text-[#1A1814]">{name}</p>
              <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] border border-[#E6E1D5] text-[#C99A4A]">
                {profile?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="space-y-4 pt-4 border-t border-[#E6E1D5]">
          <div>
            <h3 className="font-serif text-base font-bold text-[#1A1814]">
              Change Password
            </h3>
            <p className="text-xs text-[#77736C]">
              Leave blank if you do not wish to change your current password.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required only if changing password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#E6E1D5] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-gold py-2.5 px-6 text-xs font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
