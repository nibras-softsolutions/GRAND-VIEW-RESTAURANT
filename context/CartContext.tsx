'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, AddOn, CartItem } from '@/types';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  island?: string;
  houseName?: string;
  locality?: string;
  landmark?: string;
  deliveryInstructions?: string;
  deliveryAddress: string;
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
  customerInfo: CustomerInfo;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [isFoodDetailOpen, setIsFoodDetailOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: 'Mohammed Shafi',
    phone: '+91 94473 45678',
    email: 'shafi.amini@example.com',
    island: 'Amini',
    houseName: 'Kunnumpuram House',
    locality: 'Near Old Juma Masjid',
    landmark: 'Opposite BSNL Tower',
    deliveryInstructions: 'Please call when you reach nearby.',
    deliveryAddress: 'Kunnumpuram House, Near Old Juma Masjid, Amini, Lakshadweep',
  });

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('gvr_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedCust = localStorage.getItem('gvr_customer');
      if (savedCust) {
        setCustomerInfo(JSON.parse(savedCust));
      }
    } catch (e) {
      console.error('Failed to parse cart storage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('gvr_cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save cart to storage', e);
      }
    }
  }, [cart, isLoaded]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    setCustomerInfo((prev) => {
      const updated = { ...prev, ...info };
      try {
        localStorage.setItem('gvr_customer', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save customer to storage', e);
      }
      return updated;
    });
  };

  const generateCartItemId = (foodItemId: string, addOns: AddOn[]) => {
    const sortedAddonIds = (addOns || [])
      .map((a) => a.id)
      .sort()
      .join('-');
    return `${foodItemId}_${sortedAddonIds}`;
  };

  const addToCart = (
    item: FoodItem,
    quantity: number = 1,
    selectedAddOns: AddOn[] = [],
    specialInstructions?: string
  ) => {
    const cartItemId = generateCartItemId(item.id, selectedAddOns);
    const addonsPrice = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    const itemTotal = (item.price + addonsPrice) * quantity;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((ci) => ci.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          itemTotal: (item.price + addonsPrice) * newQty,
          specialInstructions: specialInstructions || updated[existingIndex].specialInstructions,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartItemId,
            foodItem: item,
            quantity,
            selectedAddOns,
            specialInstructions,
            itemTotal,
          },
        ];
      }
    });

    showToast(`Added ${quantity}× ${item.name} to cart`);
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((ci) => {
        if (ci.cartItemId === cartItemId) {
          const addonsPrice = ci.selectedAddOns.reduce((sum, a) => sum + a.price, 0);
          return {
            ...ci,
            quantity: newQuantity,
            itemTotal: (ci.foodItem.price + addonsPrice) * newQuantity,
          };
        }
        return ci;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => {
      const item = prevCart.find((ci) => ci.cartItemId === cartItemId);
      if (item) {
        showToast(`Removed ${item.foodItem.name} from cart`, 'info');
      }
      return prevCart.filter((ci) => ci.cartItemId !== cartItemId);
    });
  };

  const openFoodDetail = (item: FoodItem) => {
    setSelectedFoodItem(item);
    setIsFoodDetailOpen(true);
  };

  const closeFoodDetail = () => {
    setIsFoodDetailOpen(false);
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const deliveryCharge = subtotal >= 500 || subtotal === 0 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05); // 5% restaurant GST
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
        customerInfo,
        updateCustomerInfo,
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
