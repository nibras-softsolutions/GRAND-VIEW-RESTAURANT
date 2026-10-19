'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, CartItem, OrderStatus } from '@/types';
import { MENU_ITEMS } from '@/data/menuData';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (data: {
    items: CartItem[];
    subtotal: number;
    deliveryCharge: number;
    tax: number;
    total: number;
    roomNumber: string;
    guestName: string;
    phone: string;
    paymentMethod: 'pay-at-hotel' | 'add-to-room';
    paymentSubOption?: 'cash' | 'card';
  }) => Order;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  advanceOrderSimulation: (orderId: string) => void;
}

const DEFAULT_PAST_ORDERS: Order[] = [
  {
    id: '#GH20261012',
    createdAt: '12 Oct • 7:15 PM',
    items: [
      {
        cartItemId: 'past-1',
        foodItem: MENU_ITEMS.find((m) => m.id === 'chicken-biryani') || MENU_ITEMS[4],
        quantity: 1,
        selectedAddOns: [],
        itemTotal: 280,
      },
      {
        cartItemId: 'past-2',
        foodItem: MENU_ITEMS.find((m) => m.id === 'mango-lassi') || MENU_ITEMS[11],
        quantity: 1,
        selectedAddOns: [],
        itemTotal: 130,
      },
    ],
    subtotal: 410,
    deliveryCharge: 0,
    tax: 0,
    total: 410,
    roomNumber: '302',
    guestName: 'Alexander Wright',
    phone: '+91 98765 43210',
    paymentMethod: 'add-to-room',
    status: 'delivered',
    estimatedTime: 'Delivered',
    timeline: [
      { status: 'confirmed', title: 'Order Confirmed', description: 'Your order was received and verified.', completed: true, time: '7:16 PM' },
      { status: 'preparing', title: 'Preparing', description: 'Our chef prepared your dishes fresh.', completed: true, time: '7:28 PM' },
      { status: 'out_for_delivery', title: 'Out for Delivery', description: 'Dining steward brought order to Room 302.', completed: true, time: '7:36 PM' },
      { status: 'delivered', title: 'Delivered', description: 'Successfully handed over to guest.', completed: true, time: '7:42 PM' },
    ],
  },
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(DEFAULT_PAST_ORDERS);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('gvh_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        }
      }
      const savedCurrent = localStorage.getItem('gvh_current_order');
      if (savedCurrent) {
        setCurrentOrder(JSON.parse(savedCurrent));
      }
    } catch (e) {
      console.error('Failed to load orders from storage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('gvh_orders', JSON.stringify(orders));
      } catch (e) {
        console.error('Failed to save orders', e);
      }
    }
  }, [orders, isLoaded]);

  useEffect(() => {
    if (isLoaded && currentOrder) {
      try {
        localStorage.setItem('gvh_current_order', JSON.stringify(currentOrder));
      } catch (e) {
        console.error('Failed to save current order', e);
      }
    }
  }, [currentOrder, isLoaded]);

  const generateOrderId = () => {
    // Generate clean ID matching reference: #GH20261016 or similar
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `#GH${y}${m}${d}-${rand}`;
  };

  const createOrder = (data: {
    items: CartItem[];
    subtotal: number;
    deliveryCharge: number;
    tax: number;
    total: number;
    roomNumber: string;
    guestName: string;
    phone: string;
    paymentMethod: 'pay-at-hotel' | 'add-to-room';
    paymentSubOption?: 'cash' | 'card';
  }): Order => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderId = generateOrderId();

    const newOrder: Order = {
      id: orderId,
      createdAt: `Today • ${timeStr}`,
      items: data.items,
      subtotal: data.subtotal,
      deliveryCharge: data.deliveryCharge,
      tax: data.tax,
      total: data.total,
      roomNumber: data.roomNumber,
      guestName: data.guestName,
      phone: data.phone,
      paymentMethod: data.paymentMethod,
      paymentSubOption: data.paymentSubOption,
      status: 'confirmed',
      estimatedTime: '20–25 mins',
      timeline: [
        {
          status: 'confirmed',
          title: 'Order Confirmed',
          description: 'Your meal order has been received by our head chef.',
          completed: true,
          current: true,
          time: timeStr,
        },
        {
          status: 'preparing',
          title: 'Preparing in Kitchen',
          description: 'Our culinary team is hand-crafting your dishes with fresh ingredients.',
          completed: false,
          current: false,
        },
        {
          status: 'out_for_delivery',
          title: 'Out for In-Room Delivery',
          description: `Steward is en route to ${data.roomNumber}.`,
          completed: false,
          current: false,
        },
        {
          status: 'delivered',
          title: 'Delivered',
          description: 'Bon Appétit! Enjoy your private in-room dining.',
          completed: false,
          current: false,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
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
          estimatedTime: newStatus === 'delivered' ? 'Delivered' : newStatus === 'out_for_delivery' ? '5–8 mins' : '15–20 mins',
        };

        if (currentOrder?.id === orderId) {
          setCurrentOrder(updatedOrder);
        }

        return updatedOrder;
      })
    );
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
