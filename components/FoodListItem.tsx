'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FoodItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { Star, Plus, Check } from 'lucide-react';

interface FoodListItemProps {
  item: FoodItem;
}

export default function FoodListItem({ item }: FoodListItemProps) {
  const { openFoodDetail, addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.addOns && item.addOns.length > 0) {
      openFoodDetail(item);
      return;
    }
    addToCart(item, 1, []);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div
      onClick={() => openFoodDetail(item)}
      className="group bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E6E1D5] hover:border-[#C99A4A]/60 transition-all duration-200 hover:shadow-xs flex items-center gap-3.5 sm:gap-4 cursor-pointer select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openFoodDetail(item);
      }}
      aria-label={`View details for ${item.name}`}
    >
      {/* Square Thumbnail matching Screen 3 */}
      <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#1D1B18] shrink-0 border border-[#E6E1D5]">
        {!imageError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="80px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1D1B18] text-[#E5C07B] text-xs font-serif text-center p-1">
            {item.name}
          </div>
        )}

        {/* Veg/Non-veg badge */}
        <div className="absolute top-1.5 left-1.5 bg-white/90 p-0.5 rounded shadow-xs">
          <div
            className={`w-2 h-2 rounded-xs border flex items-center justify-center ${
              item.isVeg ? 'border-green-600' : 'border-red-600'
            }`}
          >
            <div
              className={`w-1 h-1 rounded-full ${
                item.isVeg ? 'bg-green-600' : 'bg-red-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <h4 className="font-serif text-sm sm:text-base font-bold text-[#1A1814] group-hover:text-[#C99A4A] transition-colors truncate">
          {item.name}
        </h4>

        <p className="text-[11px] text-[#77736C] line-clamp-1 sm:line-clamp-2 leading-relaxed mt-0.5 mb-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-[15px] font-bold text-[#1A1814]">
              ₹{item.price}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1A1814]">
              <Star className="w-3 h-3 fill-[#C99A4A] text-[#C99A4A]" />
              <span>{item.rating}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all active:scale-90 ${
              justAdded
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-[#FBF6EE] text-[#C99A4A] border-[#E6E1D5] hover:bg-[#C99A4A] hover:text-white hover:border-[#C99A4A]'
            }`}
            aria-label={`Add ${item.name} to cart`}
          >
            {justAdded ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
