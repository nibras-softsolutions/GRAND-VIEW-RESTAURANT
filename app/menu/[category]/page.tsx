'use client';

import React, { use, useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import FoodListItem from '@/components/FoodListItem';
import FoodCard from '@/components/FoodCard';
import StickyCartBar from '@/components/StickyCartBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { MENU_ITEMS, CATEGORIES } from '@/data/menuData';
import { Category } from '@/types';
import { Search, ArrowLeft, LayoutGrid, ListFilter } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const rawCategory = decodeURIComponent(resolvedParams.category).replace(/-/g, ' ');

  const matchedCategory = CATEGORIES.find(
    (c) => c.id.toLowerCase() === rawCategory.toLowerCase()
  )?.id || 'All';

  const [activeCategory, setActiveCategory] = useState<Category>(matchedCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredDishes = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-7 pb-24 md:pb-16 text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="p-1.5 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
                {activeCategory}
              </h1>
              <p className="text-xs text-[#77736C]">
                {filteredDishes.length} dishes in this category
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E6E1D5]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#C99A4A] text-white' : 'text-[#77736C]'}`}
            >
              <ListFilter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#C99A4A] text-white' : 'text-[#77736C]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search in ${activeCategory}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] placeholder-[#77736C]"
          />
        </div>

        {/* Categories */}
        <div className="mb-5">
          <CategoryTabs
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* Dishes */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs sm:text-sm text-[#77736C]">No dishes found in this category.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2.5">
            {filteredDishes.map((dish) => (
              <FoodListItem key={dish.id} item={dish} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {filteredDishes.map((dish) => (
              <FoodCard key={dish.id} item={dish} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <StickyCartBar />
      <MobileBottomNav />
    </div>
  );
}
