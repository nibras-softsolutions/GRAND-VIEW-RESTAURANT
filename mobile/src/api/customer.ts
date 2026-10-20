import { apiRequest, setCustomerToken } from './client';
import { SavedAddress } from '../types';

export interface CustomerProfileResponse {
  profile: {
    name: string;
    phone: string;
    email?: string;
    preferences?: any;
    savedAddresses?: SavedAddress[];
  };
}

export interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
  island?: string;
  houseName?: string;
  locality?: string;
  landmark?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    island?: string;
    houseName?: string;
    locality?: string;
    landmark?: string;
  };
  error?: string;
}

export async function registerCustomer(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await apiRequest<AuthResponse>('/api/customer/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (res.token) {
    await setCustomerToken(res.token);
  }
  return res;
}

export async function loginCustomer(emailOrPhone: string, password: string): Promise<AuthResponse> {
  const res = await apiRequest<AuthResponse>('/api/customer/login', {
    method: 'POST',
    body: JSON.stringify({ emailOrPhone, password }),
  });
  if (res.token) {
    await setCustomerToken(res.token);
  }
  return res;
}

export async function fetchCustomerProfile(): Promise<CustomerProfileResponse> {
  return apiRequest<CustomerProfileResponse>('/api/customer');
}

export async function updateCustomerProfile(data: any): Promise<any> {
  return apiRequest<any>('/api/customer', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

