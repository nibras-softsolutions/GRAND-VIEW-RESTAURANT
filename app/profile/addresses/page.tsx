'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { SavedAddress } from '@/types';
import {
  ArrowLeft,
  Home,
  Plus,
  Trash2,
  Edit2,
  Check,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const LAKSHADWEEP_ISLANDS = [
  'Amini',
  'Kavaratti',
  'Agatti',
  'Kadmat',
  'Andrott',
  'Kalpeni',
  'Kilthan',
  'Chetlat',
  'Bitra',
  'Minicoy',
];

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [island, setIsland] = useState('Amini');
  const [houseName, setHouseName] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customer');
      if (res.ok) {
        const data = await res.json();
        if (data?.profile) {
          setAddresses(data.profile.savedAddresses || []);
          if (!fullName && data.profile.name) setFullName(data.profile.name);
          if (!phone && data.profile.phone) setPhone(data.profile.phone);
        }
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setLabel('Home');
    setIsland('Amini');
    setHouseName('');
    setLocality('');
    setLandmark('');
    setDeliveryInstructions('');
    setIsDefault(addresses.length === 0);
    setShowModal(true);
  };

  const handleOpenEdit = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setLabel(addr.label || 'Home');
    setFullName(addr.fullName || '');
    setPhone(addr.phone || '');
    setIsland(addr.island || 'Amini');
    setHouseName(addr.houseName || '');
    setLocality(addr.locality || '');
    setLandmark(addr.landmark || '');
    setDeliveryInstructions(addr.deliveryInstructions || '');
    setIsDefault(Boolean(addr.isDefault));
    setShowModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formatted = `${houseName}, ${locality}, ${island}, Lakshadweep`;
      let updatedList: SavedAddress[];

      if (editingId) {
        updatedList = addresses.map((a) => {
          if (a.id === editingId) {
            return {
              ...a,
              label,
              fullName,
              phone,
              island,
              houseName,
              locality,
              landmark,
              deliveryInstructions,
              address: formatted,
              isDefault,
            };
          }
          return isDefault ? { ...a, isDefault: false } : a;
        });
      } else {
        const newAddr: SavedAddress = {
          id: `addr_${Date.now()}`,
          label,
          fullName,
          phone,
          island,
          houseName,
          locality,
          landmark,
          deliveryInstructions,
          address: formatted,
          isDefault,
        };
        updatedList = isDefault
          ? [...addresses.map((a) => ({ ...a, isDefault: false })), newAddr]
          : [...addresses, newAddr];
      }

      setAddresses(updatedList);
      setShowModal(false);

      // Save to Neon DB
      await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName || 'Mohammed Shafi',
          phone: phone || '+91 94473 45678',
          email: 'shafi.amini@example.com',
          preferences: { vegOnly: false, spicePreference: 'medium' },
          savedAddresses: updatedList,
        }),
      });
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);

    try {
      await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName || 'Mohammed Shafi',
          phone: phone || '+91 94473 45678',
          email: 'shafi.amini@example.com',
          preferences: { vegOnly: false, spicePreference: 'medium' },
          savedAddresses: updated,
        }),
      });
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);

    try {
      await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName || 'Mohammed Shafi',
          phone: phone || '+91 94473 45678',
          email: 'shafi.amini@example.com',
          preferences: { vegOnly: false, spicePreference: 'medium' },
          savedAddresses: updated,
        }),
      });
    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Header />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-16 text-left space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="p-1.5 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#1A1814]">
                Saved Addresses
              </h1>
              <p className="text-xs text-[#77736C]">Lakshadweep Local Delivery Locations</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="btn-gold py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-8 border border-[#E6E1D5] text-center">
            <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#77736C]">Loading saved addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#E6E1D5] text-center space-y-3">
            <Home className="w-10 h-10 text-[#A0988C] mx-auto" />
            <h3 className="font-serif text-base font-bold text-[#1A1814]">No Addresses Saved</h3>
            <p className="text-xs text-[#77736C] max-w-xs mx-auto">
              Add your home or workplace delivery address to quickly select during checkout.
            </p>
            <button
              onClick={handleOpenAdd}
              className="btn-gold py-2.5 px-4 rounded-xl text-xs font-semibold inline-flex"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white rounded-2xl p-4 border border-[#E6E1D5] shadow-xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-[#C99A4A]" />
                    <span className="font-bold text-sm text-[#1A1814]">{addr.label}</span>
                    {addr.isDefault ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        Default Delivery
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[11px] text-[#C99A4A] hover:underline font-semibold cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 rounded-lg text-[#77736C] hover:text-[#1A1814] hover:bg-[#FAF8F5]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#77736C] space-y-0.5">
                  <p className="font-semibold text-[#1A1814]">
                    {addr.houseName}, {addr.locality}
                  </p>
                  <p>
                    Island: <span className="font-bold text-[#1A1814]">{addr.island}</span>
                    {addr.landmark && ` • Landmark: ${addr.landmark}`}
                  </p>
                  {addr.deliveryInstructions && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg mt-1 font-medium">
                      Instructions: {addr.deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#1A1814]">
                  {editingId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[#77736C] hover:text-[#1A1814] text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#1A1814] mb-1">
                    Address Label (e.g. Home, Work, Family)
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Home"
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1814] mb-1">
                    Select Island
                  </label>
                  <select
                    value={island}
                    onChange={(e) => setIsland(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                  >
                    {LAKSHADWEEP_ISLANDS.map((isl) => (
                      <option key={isl} value={isl}>
                        {isl} Island
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1814] mb-1">
                    House Name / House Number
                  </label>
                  <input
                    type="text"
                    required
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    placeholder="e.g. Kunnumpuram House"
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1814] mb-1">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Near Old Juma Masjid"
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1814] mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite BSNL Tower"
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1814] mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="e.g. Please call when you reach nearby."
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#C99A4A]"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="accent-[#C99A4A]"
                    />
                    <span className="font-semibold text-[#1A1814]">
                      Set as default delivery address
                    </span>
                  </label>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E6E1D5]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-2 px-4 rounded-xl border border-[#E6E1D5] text-[#77736C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-gold py-2 px-5 rounded-xl text-white font-semibold cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
