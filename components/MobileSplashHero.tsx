'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HotelLogo from './HotelLogo';
import { Sparkles, Clock, BedDouble, ArrowRight } from 'lucide-react';

interface MobileSplashHeroProps {
  onDismiss?: () => void;
}

export default function MobileSplashHero({ onDismiss }: MobileSplashHeroProps) {
  return (
    <div className="relative w-full min-h-[72vh] md:hidden rounded-b-[36px] overflow-hidden text-white flex flex-col justify-between p-6 shadow-2xl bg-[#25221E]">
      {/* Background Photography with Luxury Dark Overlay */}
      <Image
        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
        alt="Grand View Hotel Luxury Resort"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-[#1D1D1B]/95 pointer-events-none" />

      {/* Top Header Logo */}
      <div className="relative z-10 pt-4 flex flex-col items-center text-center">
        <HotelLogo variant="light" size="lg" showTagline={false} />
      </div>

      {/* Center Copy */}
      <div className="relative z-10 text-center space-y-4 my-auto py-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
          Good Food <br />
          Great Moments
        </h1>
        <p className="text-xs sm:text-sm text-[#D1C9BE] max-w-xs mx-auto leading-relaxed">
          Order signature culinary dishes fresh to your doorstep or takeaway counter.
        </p>

        {/* Buttons */}
        <div className="pt-3 space-y-2.5 max-w-xs mx-auto">
          <Link
            href="/menu"
            className="w-full py-3.5 px-6 rounded-full bg-[#B98A3E] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#B98A3E]/30 active:scale-95 transition-all"
          >
            <span>Order Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/menu"
            className="w-full py-3 px-6 rounded-full border border-white/30 text-white text-xs font-medium uppercase tracking-wider flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
          >
            <span>View Menu</span>
          </Link>
        </div>
      </div>

      {/* Bottom 3 Luxury Benefits */}
      <div className="relative z-10 pt-4 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#D8B46A] mb-1">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium text-white/90">Fresh Ingredients</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#D8B46A] mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium text-white/90">30 Min Delivery</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#D8B46A] mb-1">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium text-white/90">Doorstep Delivery</span>
        </div>
      </div>
    </div>
  );
}
