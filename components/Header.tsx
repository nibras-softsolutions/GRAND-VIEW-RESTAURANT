'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import HotelLogo from './HotelLogo';
import {
  Menu as MenuIcon,
  ShoppingBag,
  User,
  Search,
  X,
  Phone,
  BedDouble,
  Clock,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';

interface HeaderProps {
  onSearchClick?: () => void;
  transparentHero?: boolean;
}

export default function Header({ onSearchClick, transparentHero = false }: HeaderProps) {
  const pathname = usePathname();
  const { totalCount, setIsCartDrawerOpen, guestInfo, setIsRoomModalOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'My Orders', href: '/orders' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-200 bg-white/95 backdrop-blur-md border-b border-[#E6E1D5] ${
          isScrolled ? 'shadow-xs' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 sm:h-18 flex items-center justify-between">
          {/* Mobile Left: Hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-[#F8F6F1] transition-colors"
              aria-label="Open mobile navigation menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Logo (Desktop Left, Mobile Center) */}
          <div className="flex-1 md:flex-initial flex justify-center md:justify-start">
            <HotelLogo variant="dark" size="md" />
          </div>

          {/* Desktop Center Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors relative py-1 font-medium ${
                    isActive
                      ? 'text-[#C99A4A] font-semibold'
                      : 'text-[#1A1814] hover:text-[#C99A4A]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#C99A4A] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Room delivery badge (desktop) */}
            <button
              onClick={() => setIsRoomModalOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[#E6E1D5] bg-[#FBF6EE] text-[#1A1814] hover:border-[#C99A4A] transition-colors"
              title="Click to change room"
            >
              <BedDouble className="w-3.5 h-3.5 text-[#C99A4A]" />
              <span>Room {guestInfo.roomNumber}</span>
              <span className="text-[10px] text-[#C99A4A] font-bold uppercase tracking-wider">
                Change
              </span>
            </button>

            {/* Search shortcut */}
            <Link
              href="/menu"
              className="p-2 rounded-lg text-[#1A1814] hover:bg-[#F8F6F1] transition-colors"
              aria-label="Search menu"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Profile (Desktop) */}
            <Link
              href="/profile"
              className="hidden sm:flex p-2 rounded-lg text-[#1A1814] hover:bg-[#F8F6F1] transition-colors"
              aria-label="Guest Profile"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 rounded-lg text-[#1A1814] hover:bg-[#F8F6F1] transition-colors"
              aria-label={`Shopping Cart with ${totalCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute 1 top-0.5 right-0.5 bg-[#C99A4A] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-fade-in">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E6E1D5] flex items-center justify-between">
              <HotelLogo size="sm" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-[#77736C] hover:text-[#1A1814] rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest In-Room Status */}
            <div className="p-4 mx-4 my-4 bg-[#FBF6EE] rounded-2xl border border-[#E6E1D5]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#C99A4A]/15 flex items-center justify-center text-[#C99A4A]">
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1814]">
                      Room {guestInfo.roomNumber}
                    </p>
                    <p className="text-[10px] text-[#77736C]">In-Room Dining</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsRoomModalOpen(true);
                  }}
                  className="text-xs font-semibold text-[#C99A4A] hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1A1814] hover:bg-[#F8F6F1]"
              >
                <Sparkles className="w-4 h-4 text-[#C99A4A]" />
                <span>Home</span>
              </Link>

              <Link
                href="/menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1A1814] hover:bg-[#F8F6F1]"
              >
                <UtensilsCrossed className="w-4 h-4 text-[#C99A4A]" />
                <span>Our Menu</span>
              </Link>

              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1A1814] hover:bg-[#F8F6F1]"
              >
                <Clock className="w-4 h-4 text-[#C99A4A]" />
                <span>My Orders</span>
              </Link>

              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1A1814] hover:bg-[#F8F6F1]"
              >
                <User className="w-4 h-4 text-[#C99A4A]" />
                <span>Guest Profile</span>
              </Link>
            </div>

            {/* Footer Support Call */}
            <div className="p-5 border-t border-[#E6E1D5] bg-[#F8F6F1]">
              <a
                href="tel:+919876543210"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-[#C99A4A] text-[#C99A4A] text-xs font-semibold hover:bg-[#C99A4A] hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Kitchen Service</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
