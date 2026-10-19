'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import FoodListItem from '@/components/FoodListItem';
import FoodCard from '@/components/FoodCard';
import StickyCartBar from '@/components/StickyCartBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { MENU_ITEMS } from '@/data/menuData';
import { Category } from '@/types';
import { Search, ArrowLeft, LayoutGrid, ListFilter } from 'lucide-react';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [vegOnly, setVegOnly] = useState(false);
  const [dishes, setDishes] = useState<any[]>(MENU_ITEMS);

  // Load live dishes from Neon DB
  React.useEffect(() => {
    fetch('/api/menu')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.dishes) && data.dishes.length > 0) {
          setDishes(data.dishes);
        }
      })
      .catch((err) => console.log('Offline: using cached dishes', err));
  }, []);

  const filteredDishes = useMemo(() => {
    return dishes.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = vegOnly ? item.isVeg : true;
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [activeCategory, searchQuery, vegOnly, dishes]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-7 pb-24 md:pb-16 text-left">
        {/* Top Header matching Screen 3 in reference image */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 -ml-1.5 rounded-lg text-[#1A1814] hover:bg-white transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1814]">
                {activeCategory === 'All' ? 'Our Menu' : activeCategory}
              </h1>
              <p className="text-xs text-[#77736C]">
                {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'} available
              </p>
            </div>
          </div>

          {/* Grid vs List toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E6E1D5]">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#C99A4A] text-white'
                  : 'text-[#77736C] hover:text-[#1A1814]'
              }`}
              title="Compact list view"
            >
              <ListFilter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#C99A4A] text-white'
                  : 'text-[#77736C] hover:text-[#1A1814]'
              }`}
              title="Grid card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Field & Dietary Filter matching Screen 3 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeCategory === 'All'
                  ? 'Search food, drinks...'
                  : `Search in ${activeCategory}...`
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E6E1D5] text-xs sm:text-sm text-[#1A1814] placeholder-[#77736C] shadow-xs focus:outline-none focus:border-[#C99A4A] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#77736C] hover:text-[#1A1814] bg-[#F8F6F1] px-2 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Veg Only Toggle */}
          <button
            type="button"
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-full border text-xs font-semibold transition-all shrink-0 ${
              vegOnly
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white border-[#E6E1D5] text-[#1A1814] hover:border-[#C99A4A]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Pure Veg Only</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="mb-5">
          <CategoryTabs
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* Dishes Listing matching Screen 3 */}
        {filteredDishes.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-[#E6E1D5] max-w-md mx-auto my-10">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A] mx-auto mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1814] mb-1">
              Nothing delicious found
            </h3>
            <p className="text-xs text-[#77736C] mb-5">
              Try another search or browse our categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setVegOnly(false);
              }}
              className="btn-gold py-2.5 px-6 text-xs uppercase tracking-wider"
            >
              View All Menu
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2.5">
            {filteredDishes.map((dish) => (
              <FoodListItem key={dish.id} item={dish} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
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
