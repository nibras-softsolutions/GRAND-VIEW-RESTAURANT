export type Category = 
  | 'All' 
  | 'Starters' 
  | 'Main Course' 
  | 'Beverages' 
  | 'Desserts' 
  | 'Healthy' 
  | 'Snacks'
  | string;

export interface AddOn {
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
  rating: number;
  reviews: number;
  image: string;
  popular?: boolean;
  chefPick?: boolean;
  isVeg?: boolean;
  spicyLevel?: 0 | 1 | 2 | 3;
  prepTime?: string;
  calories?: number;
  portionSize?: string;
  dietaryTags?: string[];
  ingredients?: string[];
  chefNotes?: string;
  addOns?: AddOn[];
}

export interface CartItem {
  cartItemId: string; // unique hash of foodItemId + sorted addon ids
  foodItem: FoodItem;
  quantity: number;
  selectedAddOns: AddOn[];
  specialInstructions?: string;
  itemTotal: number; // (price + addons) * quantity
}

export type OrderType = 'delivery' | 'pickup';
export type PaymentMethod = 'cash-on-delivery' | 'online-payment' | 'pay-at-pickup' | 'upi-qr';
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'ready_for_pickup' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'rejected';

export interface SavedAddress {
  id: string;
  label: string; // 'Home' | 'Work' | 'Other'
  fullName?: string;
  phone?: string;
  island: string; // e.g. 'Amini', 'Kavaratti', 'Agatti', 'Kadmat', 'Andrott', etc.
  houseName: string; // e.g. 'ABC House'
  locality: string; // e.g. 'Near Mosque'
  landmark?: string; // e.g. 'Opposite XYZ'
  deliveryInstructions?: string; // e.g. 'Please call when you reach nearby.'
  address?: string; // combined summary string
  isDefault?: boolean;
}

export interface CustomerProfile {
  name: string;
  phone: string;
  email: string;
  savedAddresses: SavedAddress[];
  preferences: {
    vegOnly: boolean;
    spicePreference: 'mild' | 'medium' | 'spicy';
  };
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicleInfo?: string;
  active: boolean;
  activeOrdersCount?: number;
  createdAt?: string;
}

export interface Order {
  id: string; // e.g. #GV20261019
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  orderType: OrderType;
  // Local delivery address snapshot
  deliveryAddress: string;
  island?: string;
  houseName?: string;
  locality?: string;
  landmark?: string;
  deliveryInstructions?: string;
  customerName: string;
  phone: string;
  paymentMethod: PaymentMethod;
  paymentSubOption?: 'cash' | 'card' | 'upi';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  status: OrderStatus;
  deliveryStatus?: 'unassigned' | 'assigned' | 'out_for_delivery' | 'delivered';
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  estimatedTime?: string;
  timeline: {
    status: OrderStatus;
    title: string;
    description: string;
    time?: string;
    completed: boolean;
    current?: boolean;
  }[];
}
