'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { AddOn } from '@/types';
import { ArrowLeft, Heart, Star, Plus, Minus, Check, Clock, Flame, Utensils, ChefHat, Sparkles } from 'lucide-react';

export default function FoodDetailModal() {
  const { isFoodDetailOpen, closeFoodDetail, selectedFoodItem, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (selectedFoodItem) {
      setQuantity(1);
      setSelectedAddOns([]);
      setImageError(false);
    }
  }, [selectedFoodItem]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFoodDetailOpen) {
        closeFoodDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFoodDetailOpen, closeFoodDetail]);

  if (!isFoodDetailOpen || !selectedFoodItem) return null;

  const item = selectedFoodItem;

  const toggleAddOn = (addon: AddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      return exists ? prev.filter((a) => a.id !== addon.id) : [...prev, addon];
    });
  };

  const addOnTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const currentTotal = (item.price + addOnTotal) * quantity;

  const handleAddToCart = () => {
    addToCart(item, quantity, selectedAddOns);
    closeFoodDetail();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity"
        onClick={closeFoodDetail}
        aria-hidden="true"
      />

      {/* Modal Dialog matching Screen 4 in reference image */}
      <div
        className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl border border-[#E6E1D5] z-10 max-h-[92vh] flex flex-col animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-detail-title"
      >
        {/* Top Image Container with Back & Heart Buttons */}
        <div className="relative w-full h-64 sm:h-72 bg-[#1D1B18] shrink-0">
          {!imageError ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 450px"
              priority
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#1D1B18] text-[#E5C07B] p-6 text-center">
              <span className="font-serif text-2xl font-bold">{item.name}</span>
            </div>
          )}

          {/* Top Floating Controls */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            <button
              onClick={closeFoodDetail}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#1A1814] shadow-md hover:bg-white transition-all active:scale-95 cursor-pointer"
              aria-label="Back to dishes"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer ${
                isFavorite ? 'text-[#C94A4A]' : 'text-[#77736C] hover:text-[#1A1814]'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4.5 h-4.5 ${isFavorite ? 'fill-[#C94A4A]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-left flex-1">
          {/* Dietary Tags */}
          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#FBF6EE] text-[#C99A4A] border border-[#C99A4A]/30"
                >
                  {tag}
                </span>
              ))}
              {item.isVeg !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1 ${
                    item.isVeg
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {item.isVeg ? 'Pure Veg' : 'Non-Veg'}
                </span>
              )}
            </div>
          )}

          {/* Title & Rating & Price matching Screen 4 */}
          <div>
            <h2 id="dish-detail-title" className="font-serif text-2xl font-bold text-[#1A1814]">
              {item.name}
            </h2>

            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-xs font-semibold text-[#1A1814]">
                <Star className="w-3.5 h-3.5 fill-[#C99A4A] text-[#C99A4A]" />
                <span>{item.rating}</span>
              </div>
              <span className="text-xs text-[#77736C]">({item.reviews} reviews)</span>
              {item.prepTime && (
                <>
                  <span className="text-[#D1C9BE]">•</span>
                  <span className="text-xs text-[#77736C] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C99A4A]" />
                    {item.prepTime}
                  </span>
                </>
              )}
            </div>

            <div className="text-2xl font-bold text-[#1A1814] mt-2.5">
              ₹{item.price}
            </div>
          </div>

          {/* Quick Specifications Pill Bar */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#E6E1D5]">
            <div className="text-center p-2 rounded-xl bg-[#F8F6F1]">
              <span className="text-[10px] text-[#77736C] uppercase tracking-wider block font-medium">Portion</span>
              <span className="text-xs font-semibold text-[#1A1814] truncate block mt-0.5">
                {item.portionSize || 'Individual'}
              </span>
            </div>
            <div className="text-center p-2 rounded-xl bg-[#F8F6F1]">
              <span className="text-[10px] text-[#77736C] uppercase tracking-wider block font-medium">Calories</span>
              <span className="text-xs font-semibold text-[#1A1814] truncate block mt-0.5">
                {item.calories ? `${item.calories} kcal` : '320 kcal'}
              </span>
            </div>
            <div className="text-center p-2 rounded-xl bg-[#F8F6F1]">
              <span className="text-[10px] text-[#77736C] uppercase tracking-wider block font-medium">Spice Level</span>
              <span className="text-xs font-semibold text-[#1A1814] truncate block mt-0.5">
                {item.spicyLevel === 0 ? 'Mild' : item.spicyLevel === 1 ? 'Medium 🌶️' : item.spicyLevel === 2 ? 'Spicy 🌶️🌶️' : 'Extra Hot 🌶️🌶️🌶️'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#77736C] leading-relaxed">
            {item.description}
          </p>

          {/* Chef's Signature Note */}
          {item.chefNotes && (
            <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#C99A4A]/25 text-left flex items-start gap-2.5">
              <ChefHat className="w-4 h-4 text-[#C99A4A] shrink-0 mt-0.5" />
              <p className="text-xs text-[#635742] italic leading-relaxed">
                <span className="font-semibold not-italic text-[#1A1814]">Chef&apos;s Note: </span>
                {item.chefNotes}
              </p>
            </div>
          )}

          {/* Key Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#77736C] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C99A4A]" />
                Key Ingredients
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="px-2.5 py-1 rounded-lg text-xs bg-[#F8F6F1] text-[#1A1814] border border-[#E6E1D5]"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Choose Add-ons matching Screen 4 */}
          {item.addOns && item.addOns.length > 0 && (
            <div>
              <h3 className="font-serif text-sm font-bold text-[#1A1814] mb-2.5">
                Choose Add-ons
              </h3>

              <div className="space-y-2">
                {item.addOns.map((addon) => {
                  const isChecked = selectedAddOns.some((a) => a.id === addon.id);

                  return (
                    <label
                      key={addon.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#C99A4A] bg-[#FBF6EE]'
                          : 'border-[#E6E1D5] hover:border-[#C99A4A]/50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-[#C99A4A] border-[#C99A4A] text-white'
                              : 'border-[#D1C9BE] bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-[#1A1814]">
                          {addon.name}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-[#C99A4A]">
                        + ₹{addon.price}
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAddOn(addon)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector matching Screen 4: [ -  1  + ] */}
          <div className="pt-2 flex items-center justify-center">
            <div className="flex items-center gap-6 bg-[#F8F6F1] border border-[#E6E1D5] rounded-full px-5 py-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[#1A1814] hover:bg-white disabled:opacity-30 transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-base w-4 text-center text-[#1A1814]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[#1A1814] hover:bg-white transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom CTA matching Screen 4 */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E6E1D5] shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full btn-gold py-3.5 px-6 text-sm sm:text-base font-semibold flex items-center justify-between"
          >
            <span>Add to Cart</span>
            <span>₹{currentTotal}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
