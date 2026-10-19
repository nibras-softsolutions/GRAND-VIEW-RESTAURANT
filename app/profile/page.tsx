'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyCartBar from '@/components/StickyCartBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useCart } from '@/context/CartContext';
import { HOTEL_INFO } from '@/data/menuData';
import {
  User,
  BedDouble,
  Phone,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UtensilsCrossed,
  MapPin,
  HelpCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const { guestInfo, setIsRoomModalOpen } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3]">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 pb-28 md:pb-16 space-y-6 text-left">
        {/* Guest Profile Card */}
        <div className="bg-gradient-to-br from-[#25221E] via-[#2E2822] to-[#1E1B18] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#B98A3E]/30 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-[#B98A3E]/30 border-2 border-[#D8B46A] flex items-center justify-center text-[#D8B46A] shrink-0 text-xl font-bold font-serif">
              {guestInfo.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D8B46A]">
                  Checked-in Guest
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-white truncate">
                {guestInfo.name}
              </h1>
              <p className="text-xs text-[#D1C9BE]">
                Room {guestInfo.roomNumber} • Grand View Hotel
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-[#D1C9BE]">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D8B46A]" />
              {guestInfo.phone}
            </span>
            <button
              onClick={() => setIsRoomModalOpen(true)}
              className="text-xs font-semibold text-[#D8B46A] hover:underline"
            >
              Switch Room
            </button>
          </div>
        </div>

        {/* Quick Actions List */}
        <div className="bg-white rounded-3xl border border-[#E8E3D8] overflow-hidden divide-y divide-[#E8E3D8] shadow-xs">
          <Link
            href="/orders"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-[#FAF6EE] transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] border border-[#E8E3D8] flex items-center justify-center text-[#B98A3E]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#1D1D1B] group-hover:text-[#B98A3E] transition-colors">
                  My Orders & Receipts
                </h3>
                <p className="text-xs text-[#77736C]">View active meals and history</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#77736C] group-hover:translate-x-1 transition-all" />
          </Link>

          <button
            onClick={() => setIsRoomModalOpen(true)}
            className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#FAF6EE] transition-colors group text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] border border-[#E8E3D8] flex items-center justify-center text-[#B98A3E]">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#1D1D1B] group-hover:text-[#B98A3E] transition-colors">
                  Room Details & Folio
                </h3>
                <p className="text-xs text-[#77736C]">Current Room {guestInfo.roomNumber}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#77736C] group-hover:translate-x-1 transition-all" />
          </button>

          <Link
            href="/menu"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-[#FAF6EE] transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] border border-[#E8E3D8] flex items-center justify-center text-[#B98A3E]">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#1D1D1B] group-hover:text-[#B98A3E] transition-colors">
                  In-Room Dining Menu
                </h3>
                <p className="text-xs text-[#77736C]">Browse culinary specialties</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#77736C] group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* In-Room Dining Benefits Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E3D8] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B98A3E]" />
            <h3 className="font-serif text-base font-bold text-[#1D1D1B]">
              In-Room Dining Hospitality Privileges
            </h3>
          </div>

          <div className="space-y-3 text-xs text-[#77736C]">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#B98A3E] shrink-0 mt-0.5" />
              <span>Complimentary 24-hour white-glove room delivery with no extra delivery surcharge.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#B98A3E] shrink-0 mt-0.5" />
              <span>Prepared fresh in order sequence by Grand View Hotel certified master chefs.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#B98A3E] shrink-0 mt-0.5" />
              <span>Direct room billing available — settle effortlessly at main hotel reception checkout.</span>
            </div>
          </div>
        </div>

        {/* Contact & Help Desk */}
        <div className="p-6 rounded-3xl bg-[#FAF6EE] border border-[#E8E3D8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B98A3E] text-white flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#1D1D1B]">
                Need Room Service Assistance?
              </h4>
              <p className="text-xs text-[#77736C]">
                Call our direct hospitality line: +91 98765 43210
              </p>
            </div>
          </div>

          <a
            href="tel:+919876543210"
            className="py-2.5 px-5 rounded-xl bg-[#25221E] text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            Call Desk
          </a>
        </div>
      </main>

      <Footer />
      <StickyCartBar />
      <MobileBottomNav />
    </div>
  );
}
