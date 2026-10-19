'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trash2,
  Plus,
  AlertCircle,
  Save,
} from 'lucide-react';

interface EditMenuItemPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditMenuItemPage({ params }: EditMenuItemPageProps) {
  const resolvedParams = use(params);
  const dishId = decodeURIComponent(resolvedParams.id);
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('Main Course');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [image, setImage] = useState('');
  const [isVeg, setIsVeg] = useState(false);
  const [spicyLevel, setSpicyLevel] = useState(1);
  const [prepTime, setPrepTime] = useState('20 mins');
  const [calories, setCalories] = useState('');
  const [portionSize, setPortionSize] = useState('Standard');
  const [popular, setPopular] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [chefNotes, setChefNotes] = useState('');
  const [addOns, setAddOns] = useState<{ id: string; name: string; price: number }[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch categories
    fetch('/api/admin/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories) setCategories(data.categories);
      })
      .catch(() => {});

    // 2. Fetch current dish
    fetch(`/api/admin/menu/${encodeURIComponent(dishId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Dish not found');
        return res.json();
      })
      .then((data) => {
        if (data?.item) {
          const item = data.item;
          setName(item.name || '');
          setCategoryId(item.category_id || 'Main Course');
          setDescription(item.description || '');
          setPrice(String(item.price || ''));
          setDiscountPrice(item.discount_price ? String(item.discount_price) : '');
          setImage(item.image || '');
          setIsVeg(Boolean(item.is_veg));
          setSpicyLevel(item.spicy_level ?? 1);
          setPrepTime(item.prep_time || '20 mins');
          setCalories(item.calories ? String(item.calories) : '');
          setPortionSize(item.portion_size || 'Standard');
          setPopular(Boolean(item.popular));
          setFeatured(Boolean(item.featured));
          setAvailable(Boolean(item.available));
          setChefNotes(item.chef_notes || '');

          const parsedAddons = typeof item.add_ons === 'string'
            ? JSON.parse(item.add_ons)
            : item.add_ons || [];
          setAddOns(parsedAddons);
        }
      })
      .catch((err) => {
        setError('Failed to load dish details from database.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dishId]);

  const handleAddAddon = () => {
    setAddOns((prev) => [
      ...prev,
      { id: `addon_${Date.now()}`, name: '', price: 0 },
    ]);
  };

  const handleRemoveAddon = (index: number) => {
    setAddOns((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddonChange = (index: number, field: 'name' | 'price', value: any) => {
    setAddOns((prev) =>
      prev.map((addon, idx) => {
        if (idx === index) {
          return {
            ...addon,
            [field]: field === 'price' ? Number(value) || 0 : value,
          };
        }
        return addon;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Dish name is required');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Valid price is required');
      return;
    }
    if (!image.trim()) {
      setError('Image URL is required');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/menu/${encodeURIComponent(dishId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category_id: categoryId,
          description: description.trim(),
          price: Number(price),
          discount_price: discountPrice ? Number(discountPrice) : null,
          image: image.trim(),
          is_veg: isVeg,
          spicy_level: spicyLevel,
          prep_time: prepTime,
          calories: calories ? Number(calories) : null,
          portion_size: portionSize,
          popular,
          featured,
          available,
          chef_notes: chefNotes.trim(),
          add_ons: addOns.filter((a) => a.name.trim().length > 0),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update dish');
        setSaving(false);
        return;
      }

      router.push('/admin/menu');
      router.refresh();
    } catch (err) {
      setError('Network error while saving changes');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#77736C]">
        <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading dish details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/menu"
            className="p-2 -ml-2 rounded-xl text-[#1A1814] hover:bg-white transition-colors border border-transparent hover:border-[#E6E1D5]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1A1814]">
              Edit: {name || dishId}
            </h2>
            <p className="text-xs text-[#77736C]">
              ID: {dishId} • Update price, availability, or ingredients
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6E1D5] shadow-xs space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-3 pb-2 border-b border-[#E6E1D5]">
            1. Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-3 pb-2 border-b border-[#E6E1D5]">
            2. Pricing & Dietary Type
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Discount Price (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Dietary Type
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="dietType"
                    checked={isVeg}
                    onChange={() => setIsVeg(true)}
                  />
                  <span className="text-emerald-700 font-semibold">Veg</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="dietType"
                    checked={!isVeg}
                    onChange={() => setIsVeg(false)}
                  />
                  <span className="text-red-700 font-semibold">Non-Veg</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Visuals */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-3 pb-2 border-b border-[#E6E1D5]">
            3. Photography
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Image URL
              </label>
              <input
                type="url"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              />
            </div>

            {image && (
              <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-[#E6E1D5]">
                <Image
                  src={image}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Attributes */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-3 pb-2 border-b border-[#E6E1D5]">
            4. Culinary Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Spice Level (0-3)
              </label>
              <select
                value={spicyLevel}
                onChange={(e) => setSpicyLevel(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              >
                <option value={0}>0 • Mild</option>
                <option value={1}>1 • Medium</option>
                <option value={2}>2 • Traditional Spicy</option>
                <option value={3}>3 • Extra Hot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Prep Time
              </label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Calories
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Portion Size
              </label>
              <input
                type="text"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Chef Notes
              </label>
              <input
                type="text"
                value={chefNotes}
                onChange={(e) => setChefNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Add-ons Builder */}
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E6E1D5]">
            <h3 className="font-serif text-base font-bold text-[#1A1814]">
              5. Add-ons
            </h3>
            <button
              type="button"
              onClick={handleAddAddon}
              className="text-xs font-semibold text-[#C99A4A] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Add-on</span>
            </button>
          </div>

          <div className="space-y-2">
            {addOns.map((addon, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Add-on Name"
                  value={addon.name}
                  onChange={(e) => handleAddonChange(idx, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E6E1D5] text-xs"
                />
                <div className="w-28 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#77736C]">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="40"
                    value={addon.price}
                    onChange={(e) => handleAddonChange(idx, 'price', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#E6E1D5] text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAddon(idx)}
                  className="p-2 text-[#77736C] hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-3 pb-2 border-b border-[#E6E1D5]">
            6. Availability & Badges
          </h3>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-[#C99A4A]"
              />
              <span className="font-semibold text-[#1A1814]">Available for Ordering</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="w-4 h-4 rounded text-[#C99A4A]"
              />
              <span className="font-semibold text-[#1A1814]">Popular Badge</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-[#C99A4A]"
              />
              <span className="font-semibold text-[#1A1814]">Chef&apos;s Signature Pick</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-[#E6E1D5] flex items-center justify-end gap-3">
          <Link
            href="/admin/menu"
            className="py-2.5 px-5 rounded-xl border border-[#E6E1D5] text-xs font-semibold text-[#77736C] hover:text-[#1A1814]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-gold py-2.5 px-7 text-xs font-semibold shadow-md shadow-[#C99A4A]/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save & Publish Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
