import React from 'react';
import Link from 'next/link';
import HotelLogo from './HotelLogo';
import { Phone, MapPin, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#25221E] text-white border-t border-[#B98A3E]/30 pb-20 md:pb-8 pt-10 sm:pt-14 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 pb-8 border-b border-white/10 text-center md:text-left">
          {/* Brand & Tagline */}
          <div className="space-y-3 flex flex-col items-center md:items-start">
            <HotelLogo variant="light" size="md" showTagline />
            <p className="text-xs text-[#D1C9BE] max-w-sm leading-relaxed">
              Exquisite culinary dishes crafted with farm-fresh ingredients, authentic spices, and delivered hot to your doorstep.
            </p>
          </div>

          {/* Quick Contact & Details */}
          <div className="flex flex-wrap justify-center md:justify-end gap-6 sm:gap-10 text-xs text-[#D1C9BE]">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2 hover:text-[#D8B46A] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#B98A3E]" />
              <span>+91 98765 43210</span>
            </a>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#B98A3E]" />
              <span>Marine Promenade, Kochi</span>
            </div>

            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#B98A3E]" />
              <span>11:00 AM – 11:30 PM</span>
            </div>
          </div>

          {/* Social Links with SVG Brand Icons */}
          <div className="flex items-center gap-4">
            <a
              href="#instagram"
              aria-label="Alfiya Kitchen on Instagram"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-[#D8B46A] hover:bg-[#B98A3E] hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="#facebook"
              aria-label="Alfiya Kitchen on Facebook"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-[#D8B46A] hover:bg-[#B98A3E] hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="#youtube"
              aria-label="Alfiya Kitchen on YouTube"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-[#D8B46A] hover:bg-[#B98A3E] hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#77736C]">
          <p>© {new Date().getFullYear()} Alfiya Kitchen. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/menu" className="hover:text-[#D8B46A]">Menu</Link>
            <Link href="/orders" className="hover:text-[#D8B46A]">Track Order</Link>
            <Link href="/profile" className="hover:text-[#D8B46A]">My Profile</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
