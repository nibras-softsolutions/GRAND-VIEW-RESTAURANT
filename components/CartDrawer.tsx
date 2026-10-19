'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryCharge,
    total,
  } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        setIsCartDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={() => setIsCartDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel matching Screen 5 in reference image */}
      <div
        className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl z-10 animate-fade-in sm:animate-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6E1D5] flex items-center justify-between shrink-0 bg-white">
          <h2 id="cart-drawer-title" className="font-serif text-xl font-bold text-[#1A1814]">
            Your Cart
          </h2>

          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#77736C] hover:text-[#1A1814] hover:bg-[#F8F6F1] transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items or Empty State */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A] mb-3">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1A1814] mb-1">
                Your cart is empty
              </h3>
              <p className="text-xs text-[#77736C] max-w-xs mb-5">
                Add dishes from our menu for fast doorstep delivery or takeaway.
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  router.push('/menu');
                }}
                className="btn-gold py-2.5 px-6 text-xs uppercase tracking-wider"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E6E1D5]/70">
              {cart.map((item) => (
                <div key={item.cartItemId} className="py-3.5 flex gap-3.5 items-center first:pt-1">
                  {/* Thumbnail matching Screen 5 */}
                  <div className="relative w-15 h-15 rounded-xl overflow-hidden bg-[#1D1B18] shrink-0 border border-[#E6E1D5]">
                    <Image
                      src={item.foodItem.image}
                      alt={item.foodItem.name}
                      fill
                      className="object-cover"
                      sizes="60px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="font-serif text-sm font-bold text-[#1A1814] truncate">
                      {item.foodItem.name}
                    </h4>

                    {item.selectedAddOns.length > 0 && (
                      <p className="text-[10px] text-[#77736C] truncate">
                        + {item.selectedAddOns.map((a) => a.name).join(', ')}
                      </p>
                    )}

                    <div className="text-xs font-semibold text-[#1A1814] mt-0.5">
                      ₹{item.itemTotal}
                    </div>
                  </div>

                  {/* Quantity Controls & Delete Icon matching Screen 5 */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-[#F8F6F1] border border-[#E6E1D5] rounded-lg px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-4 h-4 flex items-center justify-center text-[#1A1814] hover:opacity-70"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-3 text-center text-[#1A1814]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-4 h-4 flex items-center justify-center text-[#1A1814] hover:opacity-70"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-[#77736C] hover:text-[#C94A4A] p-1.5 transition-colors"
                      aria-label={`Remove ${item.foodItem.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout matching Screen 5 */}
        {cart.length > 0 && (
          <div className="p-5 bg-[#FAF8F5] border-t border-[#E6E1D5] shrink-0 space-y-3">
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-[#77736C]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1A1814]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#77736C]">
                <span>Delivery Charge</span>
                <span className="font-semibold text-[#1A1814]">₹{deliveryCharge}</span>
              </div>
              <div className="border-t border-[#E6E1D5] pt-2 flex justify-between text-base font-bold text-[#1A1814]">
                <span>Total</span>
                <span className="text-lg font-bold text-[#C99A4A]">₹{total}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn-gold py-3.5 px-6 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
