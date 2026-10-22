import { apiRequest } from './client';
import { Order, OrderStatus } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_ORDERS_KEY = '@alfiya_kitchen_my_orders_v1';

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

export async function cancelOrder(id: string, reason?: string): Promise<{ success: boolean }> {
  const cleanId = encodeURIComponent(id.startsWith('#') ? id : `#${id}`);
  
  // 1. First update locally so UI responds instantly
  await updateLocalOrderStatus(id, 'cancelled');

  // 2. Call remote server to update in Neon DB
  try {
    return await apiRequest<{ success: boolean }>(`/api/orders/${cleanId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'cancelled',
        timeline: [
          {
            status: 'cancelled',
            title: 'Order Cancelled',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            completed: true,
            description: reason || 'Cancelled by customer',
          },
        ],
      }),
    });
  } catch (err) {
    // Return success since local status was updated
    return { success: true };
  }
}

// ==========================================
// Local Storage & Order Tracking Helpers
// ==========================================

export async function getLocalOrders(): Promise<Order[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const list: Order[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

export async function saveOrderLocally(order: Order): Promise<void> {
  try {
    const existing = await getLocalOrders();
    const filtered = existing.filter((o) => o.id !== order.id);
    const updated = [order, ...filtered];
    await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save order locally:', e);
  }
}

export async function updateLocalOrderStatus(id: string, status: OrderStatus): Promise<void> {
  try {
    const existing = await getLocalOrders();
    const updated = existing.map((o) => {
      if (o.id === id || `#${o.id}` === id || o.id === `#${id}`) {
        return {
          ...o,
          status,
          timeline: [
            ...(o.timeline || []),
            {
              status,
              title: status === 'cancelled' ? 'Order Cancelled' : status,
              description: status === 'cancelled' ? 'Cancelled by customer' : `Status changed to ${status}`,
              completed: true,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
      }
      return o;
    });
    await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update local order status:', e);
  }
}

/**
 * Merges server orders with locally stored orders so orders placed
 * offline or freshly created on device are guaranteed to be shown.
 */
export async function getMergedOrders(): Promise<Order[]> {
  const localOrders = await getLocalOrders();

  try {
    const res = await fetchCustomerOrders();
    if (res && Array.isArray(res.orders)) {
      const serverOrders = res.orders;
      
      // Map server orders by normalized id
      const orderMap = new Map<string, Order>();
      
      // Insert server orders
      for (const ord of serverOrders) {
        orderMap.set(ord.id.replace(/^#/, ''), ord);
      }
      
      // Override/merge local orders (local may have recent cancel status or offline orders)
      for (const ord of localOrders) {
        const key = ord.id.replace(/^#/, '');
        const serverItem = orderMap.get(key);
        if (serverItem) {
          // If locally cancelled, respect cancellation
          if (ord.status === 'cancelled' && serverItem.status !== 'cancelled') {
            orderMap.set(key, { ...serverItem, status: 'cancelled' });
          }
        } else {
          // Local offline order not yet on server
          orderMap.set(key, ord);
        }
      }

      const merged = Array.from(orderMap.values());
      // Save merged back to AsyncStorage for offline access
      await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Could not fetch server orders, falling back to local orders:', err);
  }

  // If server fetch failed, return whatever is stored locally
  return localOrders;
}
