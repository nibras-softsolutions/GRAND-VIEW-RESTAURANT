'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import CategoryTabs from '@/components/CategoryTabs';
import ChefPicks from '@/components/ChefPicks';
import FoodCard from '@/components/FoodCard';
import FoodListItem from '@/components/FoodListItem';
import StickyCartBar from '@/components/StickyCartBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { MENU_ITEMS } from '@/data/menuData';
import { Category } from '@/types';
import { Search, Flame, LayoutGrid, ListFilter, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter items by category and search
  const filteredPopularItems = useMemo(() => {
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
    <div className="min-h-screen flex flex-col bg-[#F8F7F3]">
      <Header />

      <main className="flex-1 pb-16 md:pb-12">
        {/* Luxury Hero Showcase */}
        <Hero />

        {/* Value Proposition Badges */}
        <Benefits />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8 sm:space-y-12">
          {/* Quick Search Bar (Screen 2: "Search for food, drinks...") */}
          <div className="relative max-w-xl mx-auto md:mx-0">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#77736C] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, drinks, desserts..."
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl bg-white border border-[#E8E3D8] text-sm text-[#1D1D1B] placeholder-[#77736C] shadow-sm focus:outline-none focus:border-[#B98A3E] focus:ring-1 focus:ring-[#B98A3E] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-xs text-[#77736C] hover:text-[#1D1D1B] bg-[#F8F7F3] px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Categories Bar */}
          <section aria-labelledby="categories-heading">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2
                id="categories-heading"
                className="font-serif text-lg sm:text-2xl font-bold text-[#1D1D1B]"
              >
                Popular Categories
              </h2>
              {activeCategory !== 'All' && (
                <button
                  onClick={() => setActiveCategory('All')}
                  className="text-xs font-semibold text-[#B98A3E] hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <CategoryTabs
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              showDesktopVisuals={true}
            />
          </section>

          {/* Chef's Picks Section (Screen 2 & 9) */}
          {searchQuery === '' && activeCategory === 'All' && (
            <ChefPicks items={MENU_ITEMS} />
          )}

          {/* Popular Items / Filtered Menu */}
          <section aria-labelledby="popular-items-heading">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#B98A3E]" />
                <h2
                  id="popular-items-heading"
                  className="font-serif text-xl sm:text-3xl font-bold text-[#1D1D1B]"
                >
                  {searchQuery
                    ? `Search Results (${filteredPopularItems.length})`
                    : activeCategory === 'All'
                    ? 'Popular Items'
                    : `${activeCategory} Dishes`}
                </h2>
              </div>

              {/* Layout view toggle for mobile/tablet */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E8E3D8]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#B98A3E] text-white'
                      : 'text-[#77736C] hover:text-[#1D1D1B]'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#B98A3E] text-white'
                      : 'text-[#77736C] hover:text-[#1D1D1B]'
                  }`}
                  aria-label="List view"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filteredPopularItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E8E3D8] max-w-md mx-auto my-6">
                <div className="w-16 h-16 rounded-full bg-[#FAF6EE] border border-[#E8E3D8] flex items-center justify-center text-[#B98A3E] mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1D1D1B] mb-2">
                  Nothing delicious found
                </h3>
                <p className="text-xs sm:text-sm text-[#77736C] mb-6">
                  Try another search keyword or browse all our restaurant categories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="py-2.5 px-6 rounded-xl bg-[#B98A3E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A3772F] transition-colors"
                >
                  View All Menu
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {filteredPopularItems.map((dish) => (
                  <FoodCard key={dish.id} item={dish} />
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl mx-auto">
                {filteredPopularItems.map((dish) => (
                  <FoodListItem key={dish.id} item={dish} />
                ))}
              </div>
            )}
          </section>

          {/* Direct CTA banner to explore entire menu */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#25221E] text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#B98A3E]/30">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#D8B46A] mb-1">
                Fresh & Fast Delivery
              </p>
              <h3 className="font-serif text-xl sm:text-2xl font-bold">
                Craving signature curries, biryanis or desserts?
              </h3>
              <p className="text-xs sm:text-sm text-[#D1C9BE] mt-1">
                Order online for swift doorstep delivery across Kochi or takeaway from our kitchen.
              </p>
            </div>
            <Link
              href="/menu"
              className="py-3 px-6 rounded-xl bg-[#B98A3E] hover:bg-[#A3772F] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors shadow-md"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <StickyCartBar />
      <MobileBottomNav />
    </div>
  );
}
