import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, FoodAddOn, FoodItem, OrderType, SavedAddress } from '../types';
import { fetchCustomerProfile, updateCustomerProfile } from '../api/customer';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  island: string;
  houseName: string;
  locality: string;
  landmark: string;
  deliveryInstructions: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    foodItem: FoodItem,
    quantity?: number,
    selectedAddOns?: FoodAddOn[],
    specialInstructions?: string
  ) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryCharge: number;
  deliveryFee: number;
  tax: number;
  total: number;
  itemCount: number;
  totalItems: number;
  couponCode: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  customerInfo: CustomerInfo;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  savedAddresses: SavedAddress[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  saveNewAddress: (addr: Omit<SavedAddress, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  deliveryAddress: SavedAddress;
  updateDeliveryAddress: (addr: SavedAddress) => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CART: 'gvr_cart_items',
  CUSTOMER_INFO: 'gvr_customer_info',
  SAVED_ADDRS: 'gvr_saved_addresses',
  COUPON: 'gvr_coupon_code',
};

const DEFAULT_CUSTOMER_INFO: CustomerInfo = {
  name: 'Mohammed Nibras',
  phone: '+91 94472 00000',
  email: 'nibras@grandview.in',
  island: 'Amini',
  houseName: 'Baitul Noor',
  locality: 'Near Juma Masjid',
  landmark: 'Opposite Post Office',
  deliveryInstructions: 'Please call when you reach nearby.',
};

const DEFAULT_ADDRESS: SavedAddress = {
  id: 'addr_default',
  label: 'Home',
  fullName: 'Mohammed Nibras',
  phone: '+91 94472 00000',
  island: 'Amini',
  houseName: 'Baitul Noor',
  locality: 'Near Juma Masjid',
  landmark: 'Opposite Post Office',
  deliveryInstructions: 'Please call when arriving at the gate',
  isDefault: true,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(DEFAULT_CUSTOMER_INFO);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([DEFAULT_ADDRESS]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(DEFAULT_ADDRESS.id);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  // Load cached cart and customer details
  useEffect(() => {
    async function loadStoredCart() {
      try {
        const savedCart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) setCart(parsed);
        }

        const savedInfo = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMER_INFO);
        if (savedInfo) {
          setCustomerInfo(JSON.parse(savedInfo));
        }

        const savedAddrs = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ADDRS);
        if (savedAddrs) {
          const parsedAddrs = JSON.parse(savedAddrs);
          if (Array.isArray(parsedAddrs) && parsedAddrs.length > 0) {
            setSavedAddresses(parsedAddrs);
            const def = parsedAddrs.find((a: SavedAddress) => a.isDefault) || parsedAddrs[0];
            setSelectedAddressId(def.id);
          }
        }

        const savedCoupon = await AsyncStorage.getItem(STORAGE_KEYS.COUPON);
        if (savedCoupon) {
          setCouponCode(savedCoupon);
        }

        // Background sync customer profile from server
        fetchCustomerProfile()
          .then((res) => {
            if (res?.profile) {
              if (res.profile.name) {
                setCustomerInfo((prev) => ({
                  ...prev,
                  name: res.profile.name,
                  phone: res.profile.phone || prev.phone,
                  email: res.profile.email || prev.email,
                }));
              }
              if (res.profile.savedAddresses && res.profile.savedAddresses.length > 0) {
                setSavedAddresses(res.profile.savedAddresses);
                const def = res.profile.savedAddresses.find((a) => a.isDefault) || res.profile.savedAddresses[0];
                setSelectedAddressId(def.id);
                AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRS, JSON.stringify(res.profile.savedAddresses)).catch(() => {});
              }
            }
          })
          .catch(() => {});
      } catch (e) {
        console.warn('Failed to load cart from storage', e);
      }
    }
    loadStoredCart();
  }, []);

  // Save cart changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)).catch(() => {});
  }, [cart]);

  const addToCart = (
    foodItem: FoodItem,
    quantity = 1,
    selectedAddOns: FoodAddOn[] = [],
    specialInstructions = ''
  ) => {
    setCart((prevCart) => {
      const addonsTotal = selectedAddOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      const unitTotal = foodItem.price + addonsTotal;

      const addonsKey = selectedAddOns
        .map((a) => a.id)
        .sort()
        .join('-');
      const cartItemId = `${foodItem.id}_${addonsKey}_${specialInstructions.trim()}`;

      const existingIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          itemTotal: unitTotal * newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        cartItemId,
        foodItem,
        quantity,
        selectedAddOns,
        specialInstructions,
        itemTotal: unitTotal * quantity,
      };

      return [...prevCart, newItem];
    });
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.cartItemId === cartItemId) {
          const addonsTotal = item.selectedAddOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
          const unitTotal = item.foodItem.price + addonsTotal;
          return {
            ...item,
            quantity: newQty,
            itemTotal: unitTotal * newQty,
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    setCustomerInfo((prev) => {
      const updated = { ...prev, ...info };
      AsyncStorage.setItem(STORAGE_KEYS.CUSTOMER_INFO, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const saveNewAddress = async (addrData: Omit<SavedAddress, 'id'>) => {
    const newId = `addr_${Date.now()}`;
    const newAddress: SavedAddress = { ...addrData, id: newId };
    const updated = [newAddress, ...savedAddresses];
    setSavedAddresses(updated);
    setSelectedAddressId(newId);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRS, JSON.stringify(updated));
    updateCustomerProfile({ savedAddresses: updated }).catch(() => {});
  };

  const deleteAddress = async (id: string) => {
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);
    if (selectedAddressId === id) {
      setSelectedAddressId(updated[0]?.id || null);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRS, JSON.stringify(updated));
    updateCustomerProfile({ savedAddresses: updated }).catch(() => {});
  };

  const updateDeliveryAddress = (addr: SavedAddress) => {
    const existingIndex = savedAddresses.findIndex((a) => a.id === addr.id);
    let updated: SavedAddress[];
    if (existingIndex > -1) {
      updated = [...savedAddresses];
      updated[existingIndex] = addr;
    } else {
      updated = [addr, ...savedAddresses];
    }
    setSavedAddresses(updated);
    setSelectedAddressId(addr.id);
    AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRS, JSON.stringify(updated)).catch(() => {});
  };

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'FOODIE30' || normalized === 'FREESHIP' || normalized === 'GRANDVIEW') {
      setCouponCode(normalized);
      AsyncStorage.setItem(STORAGE_KEYS.COUPON, normalized).catch(() => {});
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCouponCode(null);
    AsyncStorage.removeItem(STORAGE_KEYS.COUPON).catch(() => {});
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const isPickup = orderType === 'pickup';
  
  let deliveryCharge = isPickup || subtotal === 0 ? 0 : 2.50;
  if (couponCode === 'FREESHIP') {
    deliveryCharge = 0;
  }

  let discountAmount = 0;
  if (couponCode === 'FOODIE30' && subtotal > 0) {
    discountAmount = Math.min(subtotal * 0.3, 6.0);
  } else if (couponCode === 'GRANDVIEW' && subtotal >= 10) {
    discountAmount = 5.0;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Number((taxableAmount * 0.05).toFixed(2));
  const total = Number((taxableAmount + deliveryCharge + tax).toFixed(2));
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const selectedAddr =
    savedAddresses.find((a) => a.id === selectedAddressId) ||
    savedAddresses[0] ||
    DEFAULT_ADDRESS;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryCharge,
        deliveryFee: deliveryCharge,
        tax,
        total,
        itemCount,
        totalItems: itemCount,
        couponCode,
        discountAmount,
        applyCoupon,
        removeCoupon,
        customerInfo,
        updateCustomerInfo,
        savedAddresses,
        selectedAddressId,
        setSelectedAddressId,
        saveNewAddress,
        deleteAddress,
        deliveryAddress: selectedAddr,
        updateDeliveryAddress,
        orderType,
        setOrderType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
