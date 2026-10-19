'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FoodItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { Star, Plus, Check } from 'lucide-react';

interface FoodCardProps {
  item: FoodItem;
}

export default function FoodCard({ item }: FoodCardProps) {
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
      className="group relative bg-white rounded-2xl overflow-hidden border border-[#E6E1D5] hover:border-[#C99A4A]/60 transition-all duration-200 hover:shadow-md flex flex-col cursor-pointer select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openFoodDetail(item);
      }}
      aria-label={`View details for ${item.name}`}
    >
      {/* Food Photography */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1D1B18]">
        {!imageError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#1D1B18] text-[#E5C07B] p-4 text-center">
            <span className="font-serif text-sm font-semibold">{item.name}</span>
          </div>
        )}

        {/* Veg / Non-Veg badge */}
        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs p-1 rounded-sm shadow-xs">
          <div
            className={`w-2.5 h-2.5 rounded-xs border flex items-center justify-center ${
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

        {/* Chef's Pick Badge matching reference image */}
        {item.chefPick && (
          <div className="absolute top-2.5 right-2.5 bg-[#C99A4A] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
            CHEF&apos;S PICK
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between text-left">
        <div>
          <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1814] group-hover:text-[#C99A4A] transition-colors truncate">
            {item.name}
          </h3>

          <p className="text-[11px] sm:text-xs text-[#77736C] line-clamp-2 leading-relaxed mt-1 mb-2.5">
            {item.description}
          </p>
        </div>

        {/* Price & Rating & Action button */}
        <div className="pt-2 border-t border-[#E6E1D5]/70 flex items-center justify-between">
          <div>
            <div className="text-sm sm:text-base font-bold text-[#1A1814]">
              ₹{item.price}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#1A1814] mt-0.5">
              <Star className="w-3 h-3 fill-[#C99A4A] text-[#C99A4A]" />
              <span>{item.rating}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all active:scale-90 shadow-xs ${
              justAdded
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-[#FBF6EE] border-[#E6E1D5] text-[#C99A4A] hover:bg-[#C99A4A] hover:text-white hover:border-[#C99A4A]'
            }`}
            aria-label={`Add ${item.name} to cart`}
          >
            {justAdded ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
