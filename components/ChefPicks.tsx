'use client';

import React from 'react';
import Link from 'next/link';
import { FoodItem } from '@/types';
import FoodCard from './FoodCard';

interface ChefPicksProps {
  items: FoodItem[];
}

export default function ChefPicks({ items }: ChefPicksProps) {
  const chefItems = items.filter((item) => item.chefPick).slice(0, 4);

  return (
    <section className="py-4 sm:py-8" aria-labelledby="chefs-picks-title">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            id="chefs-picks-title"
            className="font-serif text-xl sm:text-2xl font-bold text-[#1A1814]"
          >
            Chef&apos;s Picks
          </h2>
        </div>

        <Link
          href="/menu"
          className="text-xs sm:text-sm font-semibold text-[#C99A4A] hover:text-[#B0853D] transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Grid: 2 columns on mobile, 4 columns on desktop matching reference */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {chefItems.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
