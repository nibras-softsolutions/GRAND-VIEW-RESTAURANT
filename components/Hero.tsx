'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { MENU_ITEMS } from '@/data/menuData';
import { ArrowRight, Sparkles, ChefHat, Clock, ShieldCheck } from 'lucide-react';

export default function Hero() {
  const { openFoodDetail } = useCart();

  // Find featured dish (Butter Chicken matching reference)
  const featuredDish = MENU_ITEMS.find((item) => item.id === 'butter-chicken') || MENU_ITEMS[0];

  return (
    <div className="w-full">
      {/* ============================================================ */}
      {/* 1. DESKTOP HERO (Screen 8 in reference: 2-column luxury layout) */}
      {/* ============================================================ */}
      <div className="hidden md:block relative overflow-hidden bg-[#1D1B18] text-white py-12 lg:py-16 border-b border-[#E6E1D5]/20">
        {/* Subtle warm luxury backdrop glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C99A4A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Typography & CTAs matching reference */}
            <div className="col-span-6 lg:col-span-7 space-y-5 text-left">
              <span className="eyebrow block tracking-[0.2em] text-[#E5C07B]">
                AUTHENTIC FINE DINING & FAST DELIVERY
              </span>

              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.12]">
                Good Food,<br />
                Great Moments.
              </h1>

              <p className="text-sm lg:text-[15px] text-[#D1C9BE] max-w-lg leading-relaxed font-normal">
                Fresh ingredients. Authentic flavours. Exceptional taste. Handcrafted by our master chefs and delivered fresh to your doorstep.
              </p>

              <div className="flex items-center gap-4 pt-3">
                <Link
                  href="/menu"
                  className="btn-gold py-3.5 px-8 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/menu"
                  className="btn-outline-light py-3 px-6 text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>View Full Menu</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs text-[#D1C9BE]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C99A4A]" />
                  <span>30–35 Mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-[#C99A4A]" />
                  <span>Master Chefs</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C99A4A]" />
                  <span>Doorstep Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Column: Gourmet Dining Photography */}
            <div className="col-span-6 lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-[#C99A4A]/30 group">
                <Image
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
                  alt="Grand View Gourmet Dining Experience"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1280px) 50vw, 600px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                {/* Floating Dish Card Overlay */}
                <div className="absolute bottom-4 inset-x-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md text-[#1A1814] shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-[#E6E1D5]">
                      <Image
                        src={featuredDish.image}
                        alt={featuredDish.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#C99A4A]">
                        Signature Dish
                      </p>
                      <h4 className="font-serif text-sm font-bold text-[#1A1814]">
                        {featuredDish.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#1A1814]">
                        ₹{featuredDish.price}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openFoodDetail(featuredDish)}
                    className="py-1.5 px-3 rounded-full bg-[#C99A4A] hover:bg-[#B0853D] text-white text-xs font-semibold transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MOBILE PROMO HERO BANNER (Screen 2 in reference image)      */}
      {/* ============================================================ */}
      <div className="block md:hidden px-4 pt-3 pb-1">
        <div className="relative rounded-2xl overflow-hidden bg-[#1D1B18] text-white shadow-md border border-[#C99A4A]/25">
          <div className="grid grid-cols-12 items-center min-h-[148px] p-4.5">
            {/* Left Content */}
            <div className="col-span-7 space-y-1.5 z-10 text-left">
              <span className="eyebrow block text-[9px] text-[#E5C07B]">
                CHEF&apos;S SPECIAL
              </span>
              <h2 className="font-serif text-lg font-bold leading-tight text-white">
                {featuredDish.name}
              </h2>
              <p className="text-[11px] text-[#D1C9BE] line-clamp-1 leading-relaxed">
                Rich. Creamy. Irresistible.
              </p>
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() => openFoodDetail(featuredDish)}
                  className="btn-gold py-1.5 px-4 text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Right Photo */}
            <div className="col-span-5 relative h-28 flex items-center justify-end">
              <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-[#C99A4A]/40 shrink-0">
                <Image
                  src={featuredDish.image}
                  alt={featuredDish.name}
                  fill
                  className="object-cover"
                  sizes="100px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
