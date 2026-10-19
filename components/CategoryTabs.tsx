'use client';

import React from 'react';
import Image from 'next/image';
import { Category } from '@/types';
import { CATEGORIES } from '@/data/menuData';
import {
  UtensilsCrossed,
  Sparkles,
  Soup,
  Coffee,
  Cake,
  Salad,
  Sandwich,
} from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  showDesktopVisuals?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  UtensilsCrossed,
  Sparkles,
  Soup,
  Coffee,
  Cake,
  Salad,
  Sandwich,
};

// Curated preview images for Desktop "Popular Categories" (Screen 8 in reference)
const CATEGORY_IMAGES: Record<string, string> = {
  All: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
  Starters: 'https://images.unsplash.com/photo-1567184109191-3783b3240248?auto=format&fit=crop&w=400&q=80',
  'Main Course': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=400&q=80',
  Beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
  Desserts: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80',
  Healthy: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=400&q=80',
  Snacks: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80',
};

export default function CategoryTabs({
  activeCategory,
  onSelectCategory,
  showDesktopVisuals = false,
}: CategoryTabsProps) {
  return (
    <div className="w-full">
      {/* 1. Mobile & Universal Category Circles matching Screen 2 in reference image */}
      <div className="overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-4 sm:gap-6 min-w-max">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon] || UtensilsCrossed;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center gap-1.5 select-none group focus:outline-none"
              >
                {/* Circular Icon with active gold halo matching reference image */}
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 border ${
                    isActive
                      ? 'bg-[#FBF6EE] border-[#C99A4A] ring-2 ring-[#C99A4A]/25 text-[#C99A4A] shadow-xs scale-105'
                      : 'bg-white border-[#E6E1D5] text-[#77736C] group-hover:border-[#C99A4A]/60 group-hover:text-[#1A1814]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>

                {/* Category Label */}
                <span
                  className={`text-[11px] sm:text-xs tracking-tight transition-colors whitespace-nowrap ${
                    isActive
                      ? 'font-bold text-[#1A1814]'
                      : 'font-medium text-[#77736C] group-hover:text-[#1A1814]'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Desktop Visual Cards matching Screen 8 in reference */}
      {showDesktopVisuals && (
        <div className="hidden lg:grid grid-cols-5 gap-4 mt-6">
          {CATEGORIES.slice(0, 5).map((cat) => {
            const isSelected = activeCategory === cat.id;
            const imgUrl = CATEGORY_IMAGES[cat.id] || CATEGORY_IMAGES['All'];

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative rounded-2xl overflow-hidden aspect-[4/3] text-left border transition-all ${
                  isSelected
                    ? 'border-[#C99A4A] ring-2 ring-[#C99A4A]/30 shadow-md'
                    : 'border-[#E6E1D5] hover:border-[#C99A4A]/60 shadow-xs'
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="220px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 inset-x-3 text-white">
                  <p className="font-serif text-sm font-bold tracking-wide">
                    {cat.label}
                  </p>
                  <p className="text-[10px] text-[#E5C07B]">
                    {isSelected ? 'Viewing' : 'Explore dishes'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
