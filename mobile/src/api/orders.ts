import { apiRequest } from './client';
import { Order } from '../types';

export interface CreateOrderPayload {
  orderType: 'delivery' | 'pickup';
  deliveryAddress: string;
  island?: string;
  houseName?: string;
  locality?: string;
  landmark?: string;
  deliveryInstructions?: string;
  customerName: string;
  phone: string;
  email?: string;
  paymentMethod: string;
  paymentSubOption?: string;
  items: any[];
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  total: number;
}

export async function placeOrder(payload: CreateOrderPayload): Promise<{ success: boolean; order: Order }> {
  return apiRequest<{ success: boolean; order: Order }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchCustomerOrders(): Promise<{ orders: Order[] }> {
  return apiRequest<{ orders: Order[] }>('/api/orders');
}

export async function fetchOrderById(id: string): Promise<{ order: Order }> {
  const cleanId = encodeURIComponent(id.startsWith('#') ? id : `#${id}`);
  return apiRequest<{ order: Order }>(`/api/orders/${cleanId}`);
}
