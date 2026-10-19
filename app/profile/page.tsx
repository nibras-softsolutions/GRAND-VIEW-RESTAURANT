'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyCartBar from '@/components/StickyCartBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useCart } from '@/context/CartContext';
import { RESTAURANT_INFO } from '@/data/menuData';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UtensilsCrossed,
  HelpCircle,
  Plus,
  Heart,
  LogOut,
  Sliders,
  Check,
} from 'lucide-react';

export default function ProfilePage() {
  const { customerInfo, updateCustomerInfo, showToast } = useCart();

  const [savedAddresses, setSavedAddresses] = useState(RESTAURANT_INFO.savedAddresses);
  const [vegOnly, setVegOnly] = useState(false);
  const [spicePreference, setSpicePreference] = useState<'mild' | 'medium' | 'spicy'>('medium');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(customerInfo.name || 'Alexander Wright');
  const [editPhone, setEditPhone] = useState(customerInfo.phone || '+91 98765 43210');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerInfo({ name: editName, phone: editPhone });
    setIsEditing(false);
    showToast('Profile information updated successfully');
  };

  const handleSetDefaultAddress = (addrId: string) => {
    setSavedAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === addrId,
      }))
    );
    const chosen = savedAddresses.find((a) => a.id === addrId);
    if (chosen) {
      updateCustomerInfo({ deliveryAddress: chosen.address, landmark: chosen.landmark });
      showToast(`Default address set to ${chosen.label}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 pb-28 md:pb-16 space-y-6 text-left">
        {/* Customer Profile Card */}
        <div className="bg-[#1D1B18] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#C99A4A]/30 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-[#C99A4A]/25 border-2 border-[#E5C07B] flex items-center justify-center text-[#E5C07B] shrink-0 text-xl font-bold font-serif">
              {customerInfo.name ? customerInfo.name.charAt(0) : 'A'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B]">
                  Grand View Club Member
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-white truncate">
                {customerInfo.name}
              </h1>
              <p className="text-xs text-[#D1C9BE] truncate">
                {customerInfo.email || 'alex.wright@example.com'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-[#D1C9BE]">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#E5C07B]" />
              {customerInfo.phone}
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-semibold text-[#E5C07B] hover:underline cursor-pointer"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Edit profile form modal/inline */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-2xl p-5 border border-[#E6E1D5] shadow-xs space-y-3"
          >
            <h3 className="font-serif text-sm font-bold text-[#1A1814]">
              Edit Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#77736C] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs text-[#1A1814]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#77736C] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] text-xs text-[#1A1814]"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 rounded-lg border border-[#E6E1D5] text-xs font-medium text-[#77736C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-gold px-5 py-1.5 rounded-lg text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Saved Addresses Section */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6E1D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C99A4A]" />
              <h3 className="font-serif text-base font-bold text-[#1A1814]">
                Saved Delivery Addresses
              </h3>
            </div>
            <button
              onClick={() => showToast('Address manager ready — edit in checkout')}
              className="text-xs font-semibold text-[#C99A4A] hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          <div className="space-y-3">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => handleSetDefaultAddress(addr.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  addr.isDefault
                    ? 'border-[#C99A4A] bg-[#FBF6EE]'
                    : 'border-[#E6E1D5] bg-[#FAF8F5] hover:border-[#C99A4A]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    addr.isDefault ? 'bg-[#C99A4A] text-white' : 'bg-white text-[#77736C] border border-[#E6E1D5]'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#1A1814]">
                        {addr.label}
                      </h4>
                      {addr.isDefault && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#C99A4A] bg-white px-2 py-0.5 rounded-full border border-[#C99A4A]/30">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#77736C] mt-0.5 leading-relaxed">
                      {addr.address}
                    </p>
                    {addr.landmark && (
                      <p className="text-[11px] text-[#A67B2E] mt-0.5">
                        Landmark: {addr.landmark}
                      </p>
                    )}
                  </div>
                </div>

                {addr.isDefault && (
                  <div className="w-5 h-5 rounded-full bg-[#C99A4A] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dietary & Taste Preferences */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6E1D5] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C99A4A]" />
            <h3 className="font-serif text-base font-bold text-[#1A1814]">
              Dining & Taste Preferences
            </h3>
          </div>

          <div className="space-y-3.5">
            {/* Pure Veg Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E6E1D5]">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1A1814]">
                  Pure Vegetarian Only
                </h4>
                <p className="text-[11px] text-[#77736C]">
                  Filter menu to strictly show vegetarian dishes by default
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVegOnly(!vegOnly);
                  showToast(vegOnly ? 'Showing full menu' : 'Filter set to Pure Veg');
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  vegOnly ? 'bg-[#C99A4A]' : 'bg-[#D1C9BE]'
                }`}
                aria-label="Toggle vegetarian filter"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    vegOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Preferred Spice Level */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E6E1D5] space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-[#1A1814]">
                Preferred Spice Level
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {(['mild', 'medium', 'spicy'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setSpicePreference(level);
                      showToast(`Spice preference: ${level}`);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                      spicePreference === level
                        ? 'bg-[#C99A4A] text-white border-[#C99A4A] shadow-xs'
                        : 'bg-white text-[#77736C] border-[#E6E1D5] hover:border-[#C99A4A]/50'
                    }`}
                  >
                    {level === 'mild' ? 'Mild 🌿' : level === 'medium' ? 'Medium 🌶️' : 'Spicy 🌶️🌶️'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Navigation */}
        <div className="bg-white rounded-3xl border border-[#E6E1D5] overflow-hidden divide-y divide-[#E6E1D5] shadow-xs">
          <Link
            href="/orders"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-[#FAF8F5] transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1814] group-hover:text-[#C99A4A] transition-colors">
                  My Orders & Receipts
                </h3>
                <p className="text-xs text-[#77736C]">Track active food deliveries & history</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#77736C] group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/menu"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-[#FAF8F5] transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A]">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1814] group-hover:text-[#C99A4A] transition-colors">
                  Restaurant Menu
                </h3>
                <p className="text-xs text-[#77736C]">Explore all appetizers, mains, and desserts</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#77736C] group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Restaurant Contact & Help Desk */}
        <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#E6E1D5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C99A4A] text-white flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#1A1814]">
                Need Order or Table Assistance?
              </h4>
              <p className="text-xs text-[#77736C]">
                Call our direct restaurant hotline: +91 98765 43210
              </p>
            </div>
          </div>

          <a
            href="tel:+919876543210"
            className="py-2.5 px-5 rounded-xl bg-[#1D1B18] text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            Call Restaurant
          </a>
        </div>
      </main>

      <Footer />
      <StickyCartBar />
      <MobileBottomNav />
    </div>
  );
}
