'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, AddOn, CartItem } from '@/types';
import { HOTEL_INFO } from '@/data/menuData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

interface GuestInfo {
  name: string;
  roomNumber: string;
  phone: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: FoodItem, quantity?: number, selectedAddOns?: AddOn[], specialInstructions?: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  selectedFoodItem: FoodItem | null;
  openFoodDetail: (item: FoodItem) => void;
  closeFoodDetail: () => void;
  isFoodDetailOpen: boolean;
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  guestInfo: GuestInfo;
  updateGuestInfo: (info: Partial<GuestInfo>) => void;
  isRoomModalOpen: boolean;
  setIsRoomModalOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [isFoodDetailOpen, setIsFoodDetailOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>(HOTEL_INFO.defaultGuest);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('gvh_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedGuest = localStorage.getItem('gvh_guest');
      if (savedGuest) {
        setGuestInfo(JSON.parse(savedGuest));
      }
    } catch (e) {
      console.error('Failed to load storage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('gvh_cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save cart', e);
      }
    }
  }, [cart, isLoaded]);

  // Save guest info to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('gvh_guest', JSON.stringify(guestInfo));
      } catch (e) {
        console.error('Failed to save guest', e);
      }
    }
  }, [guestInfo, isLoaded]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const updateGuestInfo = (info: Partial<GuestInfo>) => {
    setGuestInfo((prev) => ({ ...prev, ...info }));
  };

  const openFoodDetail = (item: FoodItem) => {
    setSelectedFoodItem(item);
    setIsFoodDetailOpen(true);
  };

  const closeFoodDetail = () => {
    setIsFoodDetailOpen(false);
  };

  const generateCartItemId = (foodId: string, addOns: AddOn[]) => {
    const addonIds = addOns.map((a) => a.id).sort().join('_');
    return `${foodId}__${addonIds}`;
  };

  const calculateItemTotal = (price: number, addOns: AddOn[], quantity: number) => {
    const addOnTotal = addOns.reduce((sum, a) => sum + a.price, 0);
    return (price + addOnTotal) * quantity;
  };

  const addToCart = (
    item: FoodItem,
    quantity = 1,
    selectedAddOns: AddOn[] = [],
    specialInstructions = ''
  ) => {
    const cartItemId = generateCartItemId(item.id, selectedAddOns);
    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          itemTotal: calculateItemTotal(item.price, selectedAddOns, newQty),
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId,
          foodItem: item,
          quantity,
          selectedAddOns,
          specialInstructions,
          itemTotal: calculateItemTotal(item.price, selectedAddOns, quantity),
        };
        return [...prev, newItem];
      }
    });

    showToast(`${item.name} added to cart`, 'success');
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQuantity,
            itemTotal: calculateItemTotal(item.foodItem.price, item.selectedAddOns, newQuantity),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    const item = cart.find((c) => c.cartItemId === cartItemId);
    setCart((prev) => prev.filter((c) => c.cartItemId !== cartItemId));
    if (item) {
      showToast(`${item.foodItem.name} removed from cart`, 'info');
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const deliveryCharge = 0; // Free in-room dining
  const tax = 0;
  const total = subtotal + deliveryCharge + tax;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        deliveryCharge,
        tax,
        total,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        selectedFoodItem,
        openFoodDetail,
        closeFoodDetail,
        isFoodDetailOpen,
        toasts,
        showToast,
        guestInfo,
        updateGuestInfo,
        isRoomModalOpen,
        setIsRoomModalOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
