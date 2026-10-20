import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeliveryPersonUser } from '../types';
import { getDeliveryToken, setDeliveryToken, getCustomerToken, setCustomerToken } from '../api/client';
import { loginDeliveryPerson, logoutDeliveryPerson, fetchDeliveryProfile } from '../api/delivery';
import { loginCustomer, registerCustomer, RegisterPayload } from '../api/customer';

export type UserRole = 'customer' | 'delivery';

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  island?: string;
  houseName?: string;
  locality?: string;
  landmark?: string;
}

interface AuthContextType {
  role: UserRole;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  switchToCustomer: () => void;
  switchToDelivery: () => void;
  deliveryPerson: DeliveryPersonUser | null;
  customerUser: CustomerUser | null;
  isDeliveryLoggedIn: boolean;
  isCustomerLoggedIn: boolean;
  isLoading: boolean;
  deliveryLogin: (phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginDelivery: (phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  deliveryLogout: () => Promise<void>;
  logoutDelivery: () => Promise<void>;
  reloadDeliveryProfile: () => Promise<void>;
  loginCustomerAuth: (emailOrPhone: string, pass: string) => Promise<{ success: boolean; error?: string; customer?: CustomerUser }>;
  registerCustomerAuth: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string; customer?: CustomerUser }>;
  logoutCustomerAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'gvr_active_role';
const DELIVERY_USER_KEY = 'gvr_delivery_user';
const CUSTOMER_USER_KEY = 'gvr_customer_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('customer');
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPersonUser | null>(null);
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const savedRole = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
        if (savedRole === 'delivery') {
          setRoleState('delivery');
        }

        // 1. Check saved customer session
        const custToken = await getCustomerToken();
        const savedCustomer = await AsyncStorage.getItem(CUSTOMER_USER_KEY);
        if (custToken && savedCustomer) {
          try {
            setCustomerUser(JSON.parse(savedCustomer));
          } catch (e) {}
        }

        // 2. Check saved delivery session
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

  // Customer Authentication
  const loginCustomerAuth = async (emailOrPhone: string, pass: string) => {
    try {
      const res = await loginCustomer(emailOrPhone, pass);
      if (res.success && res.customer) {
        const user: CustomerUser = {
          id: res.customer.id,
          name: res.customer.name,
          phone: res.customer.phone,
          email: res.customer.email,
          island: res.customer.island,
          houseName: res.customer.houseName,
          locality: res.customer.locality,
          landmark: res.customer.landmark,
        };
        setCustomerUser(user);
        await AsyncStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
        await setRole('customer');
        return { success: true, customer: user };
      }
      return { success: false, error: res.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const registerCustomerAuth = async (payload: RegisterPayload) => {
    try {
      const res = await registerCustomer(payload);
      if (res.success && res.customer) {
        const user: CustomerUser = {
          id: res.customer.id,
          name: res.customer.name,
          phone: res.customer.phone,
          email: res.customer.email,
          island: res.customer.island,
          houseName: res.customer.houseName,
          locality: res.customer.locality,
          landmark: res.customer.landmark,
        };
        setCustomerUser(user);
        await AsyncStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
        await setRole('customer');
        return { success: true, customer: user };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logoutCustomerAuth = async () => {
    try {
      await setCustomerToken(null);
      await AsyncStorage.removeItem(CUSTOMER_USER_KEY);
      setCustomerUser(null);
    } catch (e) {}
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
        customerUser,
        isDeliveryLoggedIn: !!deliveryPerson,
        isCustomerLoggedIn: !!customerUser,
        isLoading,
        deliveryLogin,
        loginDelivery: deliveryLogin,
        deliveryLogout,
        logoutDelivery: deliveryLogout,
        reloadDeliveryProfile,
        loginCustomerAuth,
        registerCustomerAuth,
        logoutCustomerAuth,
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
