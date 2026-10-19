'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, CartItem, OrderStatus, OrderType, PaymentMethod } from '@/types';
import { MENU_ITEMS, RESTAURANT_INFO } from '@/data/menuData';

interface CreateOrderData {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  orderType: OrderType;
  deliveryAddress: string;
  landmark?: string;
  customerName: string;
  phone: string;
  paymentMethod: PaymentMethod;
  paymentSubOption?: 'cash' | 'card' | 'upi';
  // backward compatibility fields
  roomNumber?: string;
  guestName?: string;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (data: CreateOrderData) => Order;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  advanceOrderSimulation: (orderId: string) => void;
}

const DEFAULT_PAST_ORDERS: Order[] = [
  {
    id: '#GV20261018',
    createdAt: '18 Oct • 7:15 PM',
    items: [
      {
        cartItemId: 'past-1',
        foodItem: MENU_ITEMS.find((m) => m.id === 'butter-chicken') || MENU_ITEMS[0],
        quantity: 1,
        selectedAddOns: [
          { id: 'naan-1', name: 'Butter Garlic Naan', price: 40 },
        ],
        itemTotal: 360,
      },
      {
        cartItemId: 'past-2',
        foodItem: MENU_ITEMS.find((m) => m.id === 'fresh-lime-soda') || MENU_ITEMS[10],
        quantity: 1,
        selectedAddOns: [],
        itemTotal: 90,
      },
    ],
    subtotal: 450,
    deliveryCharge: 40,
    tax: 0,
    total: 490,
    orderType: 'delivery',
    deliveryAddress: 'Flat 4B, Marine View Heights, Waterfront Promenade, Kochi',
    landmark: 'Near Waterfront Light House',
    customerName: 'Alexander Wright',
    guestName: 'Alexander Wright',
    phone: '+91 98765 43210',
    paymentMethod: 'cash-on-delivery',
    status: 'delivered',
    estimatedTime: 'Delivered',
    timeline: [
      { status: 'confirmed', title: 'Order Confirmed', description: 'Your order was received and verified.', completed: true, time: '7:16 PM' },
      { status: 'preparing', title: 'Preparing in Kitchen', description: 'Our chef prepared your dishes fresh.', completed: true, time: '7:28 PM' },
      { status: 'out_for_delivery', title: 'Out for Delivery', description: 'Delivery partner arrived at delivery location.', completed: true, time: '7:40 PM' },
      { status: 'delivered', title: 'Delivered', description: 'Order handed over. Bon Appétit!', completed: true, time: '7:46 PM' },
    ],
  },
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(DEFAULT_PAST_ORDERS);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Load local cache first for instant render
    try {
      const savedOrders = localStorage.getItem('gvr_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        }
      }
      const savedCurrent = localStorage.getItem('gvr_current_order');
      if (savedCurrent) {
        setCurrentOrder(JSON.parse(savedCurrent));
      }
    } catch (e) {
      console.error('Failed to load orders from storage', e);
    }
    setIsLoaded(true);

    // 2. Fetch live orders from Neon PostgreSQL
    fetch('/api/orders')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders((prev) => {
            const remoteIds = new Set(data.orders.map((o: Order) => o.id));
            const localOnly = prev.filter((o) => !remoteIds.has(o.id));
            return [...data.orders, ...localOnly];
          });
        }
      })
      .catch((err) => {
        console.log('Neon database sync: using offline cache', err);
      });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('gvr_orders', JSON.stringify(orders));
      } catch (e) {
        console.error('Failed to save orders', e);
      }
    }
  }, [orders, isLoaded]);

  useEffect(() => {
    if (isLoaded && currentOrder) {
      try {
        localStorage.setItem('gvr_current_order', JSON.stringify(currentOrder));
      } catch (e) {
        console.error('Failed to save current order', e);
      }
    }
  }, [currentOrder, isLoaded]);

  const generateOrderId = () => {
    // Generate clean restaurant ID: #GV20261019-XXXX
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `#GV${y}${m}${d}-${rand}`;
  };

  const createOrder = (data: CreateOrderData): Order => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderId = generateOrderId();
    const isPickup = data.orderType === 'pickup';

    const customerName = data.customerName || data.guestName || RESTAURANT_INFO.defaultCustomer.name;
    const address = isPickup
      ? 'Grand View Restaurant (Front Counter Pickup)'
      : data.deliveryAddress || RESTAURANT_INFO.defaultCustomer.deliveryAddress;

    const newOrder: Order = {
      id: orderId,
      createdAt: `Today • ${timeStr}`,
      items: data.items,
      subtotal: data.subtotal,
      deliveryCharge: isPickup ? 0 : data.deliveryCharge,
      tax: data.tax,
      total: data.total,
      orderType: data.orderType || 'delivery',
      deliveryAddress: address,
      landmark: data.landmark,
      customerName,
      guestName: customerName,
      phone: data.phone || RESTAURANT_INFO.defaultCustomer.phone,
      paymentMethod: data.paymentMethod,
      paymentSubOption: data.paymentSubOption,
      status: 'confirmed',
      estimatedTime: isPickup ? '15–20 mins' : '30–35 mins',
      timeline: isPickup
        ? [
            {
              status: 'confirmed',
              title: 'Order Confirmed',
              description: 'Your order has been received and verified by the kitchen.',
              completed: true,
              current: true,
              time: timeStr,
            },
            {
              status: 'preparing',
              title: 'Kitchen Preparing',
              description: 'Our culinary team is hand-crafting your meal fresh.',
              completed: false,
              current: false,
            },
            {
              status: 'out_for_delivery',
              title: 'Ready for Pickup',
              description: 'Your package is ready at Grand View Restaurant counter.',
              completed: false,
              current: false,
            },
            {
              status: 'delivered',
              title: 'Picked Up',
              description: 'Order collected. Thank you for dining with us!',
              completed: false,
              current: false,
            },
          ]
        : [
            {
              status: 'confirmed',
              title: 'Order Confirmed',
              description: 'Your order has been accepted by Grand View Restaurant.',
              completed: true,
              current: true,
              time: timeStr,
            },
            {
              status: 'preparing',
              title: 'Kitchen Preparing',
              description: 'Our chefs are cooking your dishes with farm-fresh ingredients.',
              completed: false,
              current: false,
            },
            {
              status: 'out_for_delivery',
              title: 'Out for Delivery',
              description: `Rider is on the way to ${address}.`,
              completed: false,
              current: false,
            },
            {
              status: 'delivered',
              title: 'Delivered',
              description: 'Order arrived. Enjoy your delicious food!',
              completed: false,
              current: false,
            },
          ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);

    // Sync to Neon PostgreSQL
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch((err) => console.log('Offline: order saved to local state', err));

    return newOrder;
  };

  const getOrderById = (id: string) => {
    const cleanId = decodeURIComponent(id);
    return orders.find(
      (o) => o.id.toLowerCase() === cleanId.toLowerCase() || o.id.replace('#', '').toLowerCase() === cleanId.replace('#', '').toLowerCase()
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const statuses: OrderStatus[] = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const targetIdx = statuses.indexOf(newStatus);
    let targetUpdatedOrder: Order | null = null;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedTimeline = order.timeline.map((step) => {
          const stepIdx = statuses.indexOf(step.status);
          return {
            ...step,
            completed: stepIdx <= targetIdx,
            current: step.status === newStatus,
            time: stepIdx <= targetIdx && !step.time ? 'Just now' : step.time,
          };
        });

        const updatedOrder: Order = {
          ...order,
          status: newStatus,
          timeline: updatedTimeline,
          estimatedTime: newStatus === 'delivered' ? 'Delivered' : newStatus === 'out_for_delivery' ? '5–10 mins' : '15–20 mins',
        };

        targetUpdatedOrder = updatedOrder;

        if (currentOrder?.id === orderId) {
          setCurrentOrder(updatedOrder);
        }

        return updatedOrder;
      })
    );

    // Sync status update to Neon PostgreSQL
    if (targetUpdatedOrder) {
      fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          timeline: (targetUpdatedOrder as Order).timeline,
        }),
      }).catch((err) => console.log('Offline: status update saved locally', err));
    }
  };

  const advanceOrderSimulation = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const statuses: OrderStatus[] = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIdx = statuses.indexOf(order.status);
    if (currentIdx < statuses.length - 1) {
      const nextStatus = statuses[currentIdx + 1];
      updateOrderStatus(orderId, nextStatus);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        createOrder,
        getOrderById,
        updateOrderStatus,
        advanceOrderSimulation,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
