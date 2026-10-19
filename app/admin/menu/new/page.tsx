'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  UploadCloud,
  ImageIcon,
} from 'lucide-react';

export default function AdminNewMenuItemPage() {
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
  const [prepTime, setPrepTime] = useState('20-25 mins');
  const [calories, setCalories] = useState('');
  const [portionSize, setPortionSize] = useState('Serves 1-2 • 350g');
  const [popular, setPopular] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [chefNotes, setChefNotes] = useState('');

  // Add-ons list
  const [addOns, setAddOns] = useState<{ id: string; name: string; price: number }[]>([
    { id: 'add_1', name: 'Butter Garlic Naan', price: 40 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

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
      setError('Please provide a dish name.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Please provide a valid price.');
      return;
    }
    if (!image.trim()) {
      setError('Please provide an image URL for the dish.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
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

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create menu item');
        setLoading(false);
        return;
      }

      router.push('/admin/menu');
      router.refresh();
    } catch (err) {
      setError('Network error. Failed to save menu item.');
      setLoading(false);
    }
  };

  // Sample quick image picker presets for convenience
  const sampleImages = [
    { label: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
    { label: 'Curry / Gravy', url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80' },
    { label: 'Starter / Kebab', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80' },
    { label: 'Dessert', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Beverage', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
  ];

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
              Add New Dish
            </h2>
            <p className="text-xs text-[#77736C]">
              Create a signature culinary item for Grand View Restaurant
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

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6E1D5] shadow-xs space-y-6">
        {/* Basic Information */}
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
                placeholder="e.g. Malabar Chicken Roast"
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
                placeholder="Describe flavors, preparation method, and ingredients..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Dietary */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-3 pb-2 border-b border-[#E6E1D5]">
            2. Pricing & Dietary
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
                placeholder="320"
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
                placeholder="Leave blank if none"
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
                    className="text-[#C99A4A]"
                  />
                  <span className="text-emerald-700 font-semibold">Veg</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="dietType"
                    checked={!isVeg}
                    onChange={() => setIsVeg(false)}
                    className="text-[#C99A4A]"
                  />
                  <span className="text-red-700 font-semibold">Non-Veg</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Photography & Visuals */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-3 pb-2 border-b border-[#E6E1D5]">
            3. Photography & Presentation
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Food Image URL *
              </label>
              <input
                type="url"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs text-[#77736C]">
              <span>Quick Presets:</span>
              {sampleImages.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setImage(s.url)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E6E1D5] hover:border-[#C99A4A] text-[11px] font-semibold text-[#1A1814]"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Live Image Preview */}
            {image && (
              <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-[#E6E1D5] bg-[#FAF8F5]">
                <Image
                  src={image}
                  alt="Preview"
                  fill
                  className="object-cover"
                  onError={() => setError('Image URL appears broken or cannot be loaded.')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Preparation, Spice, and Portion */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-3 pb-2 border-b border-[#E6E1D5]">
            4. Culinary Attributes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Spice Level (0-3)
              </label>
              <select
                value={spicyLevel}
                onChange={(e) => setSpicyLevel(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              >
                <option value={0}>0 • Non-Spicy / Mild</option>
                <option value={1}>1 • Medium Spiced</option>
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
                placeholder="20-25 mins"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="380"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
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
                placeholder="Serves 1-2 • 400g"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                Chef Notes / Secret Pairing
              </label>
              <input
                type="text"
                value={chefNotes}
                onChange={(e) => setChefNotes(e.target.value)}
                placeholder="e.g. Best savored with hot garlic butter naan and fresh lime."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
              />
            </div>
          </div>
        </div>

        {/* Add-ons Builder */}
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E6E1D5]">
            <h3 className="font-serif text-base font-bold text-[#1A1814]">
              5. Customization Add-ons
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
                  placeholder="Add-on Name (e.g. Extra Gravy)"
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
                  title="Remove addon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Status & Visibility Flags */}
        <div>
          <h3 className="font-serif text-base font-bold text-[#1A1814] mb-3 pb-2 border-b border-[#E6E1D5]">
            6. Status & Badges
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
              <span className="font-semibold text-[#1A1814]">Mark as Popular</span>
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

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#E6E1D5] flex items-center justify-end gap-3">
          <Link
            href="/admin/menu"
            className="py-2.5 px-5 rounded-xl border border-[#E6E1D5] text-xs font-semibold text-[#77736C] hover:text-[#1A1814] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-gold py-2.5 px-7 text-xs font-semibold shadow-md shadow-[#C99A4A]/20 disabled:opacity-50"
          >
            {loading ? 'Creating Dish...' : 'Publish Dish to Live Menu'}
          </button>
        </div>
      </form>
    </div>
  );
}
