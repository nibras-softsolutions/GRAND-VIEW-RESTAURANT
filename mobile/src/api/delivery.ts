import { apiRequest } from './client';
import { DeliveryPersonUser, Order } from '../types';

export interface DeliveryLoginResponse {
  success: boolean;
  token?: string;
  sessionId?: string;
  deliveryPerson: DeliveryPersonUser;
  error?: string;
}

export async function loginDeliveryPerson(
  phone: string,
  password: string
): Promise<DeliveryLoginResponse> {
  return apiRequest<DeliveryLoginResponse>('/api/delivery/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export async function logoutDeliveryPerson(): Promise<void> {
  try {
    await apiRequest('/api/delivery/auth/logout', { method: 'POST' });
  } catch (e) {
    console.log('Logout API call finished', e);
  }
}

export async function fetchDeliveryProfile(): Promise<{ profile: any }> {
  return apiRequest<{ profile: any }>('/api/delivery/profile');
}

export async function updateDeliveryProfile(data: {
  name: string;
  phone?: string;
  vehicle_info?: string;
  current_password?: string;
  new_password?: string;
}): Promise<{ success: boolean; message: string; profile?: any }> {
  return apiRequest('/api/delivery/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function fetchAssignedDeliveries(
  filter: 'active' | 'completed' | 'all' = 'active'
): Promise<{ orders: Order[]; count: number }> {
  return apiRequest<{ orders: Order[]; count: number }>(
    `/api/delivery/orders?filter=${filter}`
  );
}

export async function fetchDeliveryOrderDetail(id: string): Promise<{ order: Order }> {
  const cleanId = encodeURIComponent(id.startsWith('#') ? id : `#${id}`);
  return apiRequest<{ order: Order }>(`/api/delivery/orders/${cleanId}`);
}

export async function updateDeliveryStatus(
  id: string,
  action: 'start_delivery' | 'mark_delivered',
  notes?: string
): Promise<{ success: boolean; status: string; deliveryStatus: string; message: string }> {
  const cleanId = encodeURIComponent(id.startsWith('#') ? id : `#${id}`);
  return apiRequest(`/api/delivery/orders/${cleanId}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, notes }),
  });
}
