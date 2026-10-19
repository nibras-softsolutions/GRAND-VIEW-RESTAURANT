export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected';

export type OrderType = 'delivery' | 'pickup';

export type PaymentMethod =
  | 'cash-on-delivery'
  | 'online-payment'
  | 'pay-at-pickup';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order?: number;
  active?: boolean;
}

export interface FoodAddOn {
  id: string;
  name: string;
  price: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  discountPrice?: number;
  rating?: number;
  reviews?: number;
  image: string;
  popular?: boolean;
  chefPick?: boolean;
  isVeg: boolean;
  spicyLevel?: number;
  prepTime?: string;
  calories?: number;
  portionSize?: string;
  dietaryTags?: string[];
  chefNotes?: string;
  addOns?: FoodAddOn[];
}

export interface CartItem {
  cartItemId: string;
  foodItem: FoodItem;
  quantity: number;
  selectedAddOns: FoodAddOn[];
  itemTotal: number;
  specialInstructions?: string;
}

export interface SavedAddress {
  id: string;
  label: string; // 'Home' | 'Work' | 'Other'
  fullName: string;
  phone: string;
  island: string;
  houseName: string;
  locality: string;
  landmark?: string;
  deliveryInstructions?: string;
  address?: string;
  isDefault?: boolean;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  title: string;
  description: string;
  time?: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  orderType: OrderType;
  deliveryAddress: string;
  island?: string;
  houseName?: string;
  locality?: string;
  landmark?: string;
  deliveryInstructions?: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  deliveryStatus?: 'unassigned' | 'assigned' | 'out_for_delivery' | 'delivered';
  customerName: string;
  phone: string;
  email?: string;
  paymentMethod: PaymentMethod;
  paymentSubOption?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  status: OrderStatus;
  estimatedTime?: string;
  timeline: OrderTimelineStep[];
}

export interface DeliveryPersonUser {
  id: string;
  name: string;
  phone: string;
  vehicleInfo?: string;
  active: boolean;
}

export interface RestaurantSettings {
  general: {
    name: string;
    tagline: string;
    phone: string;
    email: string;
    address: string;
    openHours: string;
    isOpen: boolean;
    closureNotice?: string;
  };
  ordering: {
    pickupEnabled: boolean;
    deliveryEnabled: boolean;
    standardDeliveryFee: number;
    freeDeliveryThreshold: number;
    minimumOrderAmount: number;
    taxRatePercent: number;
    pickupTimeEstimate: string;
    deliveryTimeEstimate: string;
  };
}
