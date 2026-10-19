import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeliveryPersonUser } from '../types';
import { getDeliveryToken, setDeliveryToken } from '../api/client';
import { loginDeliveryPerson, logoutDeliveryPerson, fetchDeliveryProfile } from '../api/delivery';

export type UserRole = 'customer' | 'delivery';

interface AuthContextType {
  role: UserRole;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  switchToCustomer: () => void;
  switchToDelivery: () => void;
  deliveryPerson: DeliveryPersonUser | null;
  isDeliveryLoggedIn: boolean;
  isLoading: boolean;
  deliveryLogin: (phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginDelivery: (phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  deliveryLogout: () => Promise<void>;
  logoutDelivery: () => Promise<void>;
  reloadDeliveryProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'gvr_active_role';
const DELIVERY_USER_KEY = 'gvr_delivery_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('customer');
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPersonUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const savedRole = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
        if (savedRole === 'delivery') {
          setRoleState('delivery');
        }

        const token = await getDeliveryToken();
        const savedUser = await AsyncStorage.getItem(DELIVERY_USER_KEY);
        if (token && savedUser) {
          const parsed = JSON.parse(savedUser);
          setDeliveryPerson(parsed);

          // Verify session in background
          fetchDeliveryProfile()
            .then((res) => {
              if (res.profile) {
                setDeliveryPerson({
                  id: res.profile.id,
                  name: res.profile.name,
                  phone: res.profile.phone,
                  vehicleInfo: res.profile.vehicle_info,
                  active: res.profile.is_active !== false,
                });
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        console.warn('Error loading auth from storage:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuth();
  }, []);

  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      await AsyncStorage.setItem(ROLE_STORAGE_KEY, newRole);
    } catch (e) {}
  };

  const switchToCustomer = () => {
    setRole('customer');
  };

  const switchToDelivery = () => {
    setRole('delivery');
  };

  const deliveryLogin = async (phone: string, pass: string) => {
    try {
      const res = await loginDeliveryPerson(phone, pass);
      if (res.success && res.deliveryPerson) {
        setDeliveryPerson(res.deliveryPerson);
        await AsyncStorage.setItem(DELIVERY_USER_KEY, JSON.stringify(res.deliveryPerson));
        await setRole('delivery');
        return { success: true };
      }
      return { success: false, error: res.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const deliveryLogout = async () => {
    try {
      await logoutDeliveryPerson();
    } catch (e) {}
    await setDeliveryToken(null);
    await AsyncStorage.removeItem(DELIVERY_USER_KEY);
    setDeliveryPerson(null);
    await setRole('customer');
  };

  const reloadDeliveryProfile = async () => {
    try {
      const res = await fetchDeliveryProfile();
      if (res.profile) {
        const updated: DeliveryPersonUser = {
          id: res.profile.id,
          name: res.profile.name,
          phone: res.profile.phone,
          vehicleInfo: res.profile.vehicle_info,
          active: res.profile.is_active !== false,
        };
        setDeliveryPerson(updated);
        await AsyncStorage.setItem(DELIVERY_USER_KEY, JSON.stringify(updated));
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        currentRole: role,
        setRole,
        switchToCustomer,
        switchToDelivery,
        deliveryPerson,
        isDeliveryLoggedIn: !!deliveryPerson,
        isLoading,
        deliveryLogin,
        loginDelivery: deliveryLogin,
        deliveryLogout,
        logoutDelivery: deliveryLogout,
        reloadDeliveryProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
