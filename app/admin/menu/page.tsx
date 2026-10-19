'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Copy,
  UtensilsCrossed,
  Eye,
} from 'lucide-react';

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [loading, setLoading] = useState(true);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<any | null>(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === 'All'
        ? `/api/admin/menu?search=${encodeURIComponent(searchQuery)}`
        : `/api/admin/menu?category=${encodeURIComponent(selectedCategory)}&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (e) {
      console.error('Failed to fetch admin menu', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error('Failed to fetch categories', e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMenu();
  };

  const handleToggleAvailability = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentVal }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, available: !currentVal } : item))
        );
      }
    } catch (e) {
      console.error('Failed to toggle availability', e);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await fetch(`/api/admin/menu/${deleteConfirmItem.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== deleteConfirmItem.id));
        setDeleteConfirmItem(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete dish');
      }
    } catch (e) {
      console.error('Failed to delete item', e);
    }
  };

  const filteredItems = items.filter((item) => {
    if (availabilityFilter === 'available') return item.available;
    if (availabilityFilter === 'unavailable') return !item.available;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1814]">
            Menu Catalog
          </h2>
          <p className="text-xs text-[#77736C]">
            Live dishes displayed to customers on website. Changes reflect immediately.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/categories"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E6E1D5] hover:border-[#C99A4A] text-xs font-semibold text-[#1A1814] transition-colors"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/menu/new"
            className="btn-gold py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish name, ingredients..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E6E1D5] text-xs text-[#1A1814] placeholder-[#77736C] focus:outline-hidden focus:border-[#C99A4A]"
          />
        </form>

        {/* Availability Filter & Category Select */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E6E1D5] text-xs font-semibold text-[#1A1814] focus:outline-hidden focus:border-[#C99A4A]"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E6E1D5] text-xs font-semibold text-[#1A1814] focus:outline-hidden focus:border-[#C99A4A]"
          >
            <option value="all">All Availability</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable (Sold Out)</option>
          </select>
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xs overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading dishes from Neon database...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            No dishes found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E6E1D5] text-[#77736C] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Dish</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D5]/60">
                {filteredItems.map((dish) => (
                  <tr key={dish.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    {/* Image & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#1D1B18] shrink-0 border border-[#E6E1D5]">
                          <Image
                            src={dish.image}
                            alt={dish.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#1A1814] text-sm truncate max-w-[200px]">
                            {dish.name}
                          </p>
                          <p className="text-[11px] text-[#77736C] truncate max-w-[220px]">
                            {dish.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E6E1D5] font-semibold text-[#1A1814] text-[11px]">
                        {dish.category_id}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-[#1A1814] text-sm">
                      ₹{dish.price}
                    </td>

                    {/* Veg & Badges */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
                            dish.is_veg
                              ? 'border-emerald-600 text-emerald-600'
                              : 'border-red-600 text-red-600'
                          }`}
                          title={dish.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              dish.is_veg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                        </span>

                        {dish.popular && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Popular
                          </span>
                        )}
                        {dish.featured && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#C99A4A]/20 text-[#B0853D]">
                            Chef Pick
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Available Toggle */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(dish.id, dish.available)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          dish.available ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                        title={dish.available ? 'Available (click to mark sold out)' : 'Sold out (click to mark available)'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            dish.available ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/menu/${dish.id}`}
                          className="p-1.5 rounded-lg text-[#77736C] hover:text-[#1A1814] hover:bg-[#FAF8F5] transition-colors"
                          title="Edit Dish"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(dish)}
                          className="p-1.5 rounded-lg text-[#77736C] hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Soft Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E6E1D5] space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-serif text-lg font-bold text-[#1A1814]">
                Delete Menu Item?
              </h3>
              <p className="text-xs text-[#77736C] mt-1 leading-relaxed">
                <span className="font-semibold text-[#1A1814]">{deleteConfirmItem.name}</span> will be removed from the active restaurant menu. Historical customer orders will remain preserved.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E6E1D5] text-xs font-semibold text-[#77736C] hover:text-[#1A1814] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow-xs transition-colors"
              >
                Delete Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
