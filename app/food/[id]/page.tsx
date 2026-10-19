'use client';

import React, { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyCartBar from '@/components/StickyCartBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { MENU_ITEMS } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { AddOn } from '@/types';
import { ArrowLeft, Heart, Star, Plus, Minus, Check, ChevronRight } from 'lucide-react';

interface FoodDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function FoodDetailPage({ params }: FoodDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { addToCart } = useCart();

  const item = MENU_ITEMS.find(
    (m) => m.id.toLowerCase() === resolvedParams.id.toLowerCase()
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-serif text-2xl font-bold mb-2">Dish Not Found</h2>
          <p className="text-sm text-[#77736C] mb-6">
            The dish you requested could not be located in our kitchen menu.
          </p>
          <Link
            href="/menu"
            className="btn-gold py-2.5 px-6 text-xs uppercase tracking-wider inline-flex"
          >
            Browse Menu
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const toggleAddOn = (addon: AddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      return exists ? prev.filter((a) => a.id !== addon.id) : [...prev, addon];
    });
  };

  const addOnTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const currentTotal = (item.price + addOnTotal) * quantity;

  const handleAddToCart = () => {
    addToCart(item, quantity, selectedAddOns);
    router.push('/cart');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Header />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 pb-28 md:pb-16 text-left">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#77736C] mb-3">
          <Link href="/" className="hover:text-[#C99A4A]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/menu" className="hover:text-[#C99A4A]">Menu</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1A1814] font-medium truncate">{item.name}</span>
        </div>

        {/* Card matching Screen 4 in reference */}
        <div className="bg-white rounded-3xl overflow-hidden border border-[#E6E1D5] shadow-xs">
          {/* Top Full Bleed Image */}
          <div className="relative w-full h-64 sm:h-80 bg-[#1D1B18]">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              priority
            />

            <div className="absolute top-4 inset-x-4 flex justify-between z-10">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#1A1814] shadow-md hover:bg-white"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md ${
                  isFavorite ? 'text-[#C94A4A]' : 'text-[#77736C]'
                }`}
                aria-label="Favorite"
              >
                <Heart className={`w-4.5 h-4.5 ${isFavorite ? 'fill-[#C94A4A]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Details Content matching Screen 4 */}
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
                {item.name}
              </h1>

              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-[#1A1814]">
                  <Star className="w-3.5 h-3.5 fill-[#C99A4A] text-[#C99A4A]" />
                  <span>{item.rating}</span>
                </div>
                <span className="text-xs text-[#77736C]">({item.reviews} reviews)</span>
              </div>

              <div className="text-xl font-bold text-[#1A1814] mt-2.5">
                ₹{item.price}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#77736C] leading-relaxed">
              {item.description}
            </p>

            <hr className="border-[#E6E1D5]" />

            {/* Add-ons */}
            {item.addOns && item.addOns.length > 0 && (
              <div>
                <h3 className="font-serif text-sm font-bold text-[#1A1814] mb-2.5">
                  Choose Add-ons
                </h3>
                <div className="space-y-2">
                  {item.addOns.map((addon) => {
                    const isChecked = selectedAddOns.some((a) => a.id === addon.id);
                    return (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'border-[#C99A4A] bg-[#FBF6EE]'
                            : 'border-[#E6E1D5] hover:border-[#C99A4A]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center ${
                              isChecked
                                ? 'bg-[#C99A4A] border-[#C99A4A] text-white'
                                : 'border-[#D1C9BE]'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-[#1A1814]">
                            {addon.name}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-[#C99A4A]">
                          + ₹{addon.price}
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddOn(addon)}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector: [ -  1  + ] */}
            <div className="pt-2 flex items-center justify-center">
              <div className="flex items-center gap-6 bg-[#F8F6F1] border border-[#E6E1D5] rounded-full px-5 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-base w-4 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full btn-gold py-3.5 px-6 text-sm sm:text-base font-semibold flex items-center justify-between"
              >
                <span>Add to Cart</span>
                <span>₹{currentTotal}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <StickyCartBar />
      <MobileBottomNav />
    </div>
  );
}
