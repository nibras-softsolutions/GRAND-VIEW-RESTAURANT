export type Category = 
  | 'All' 
  | 'Starters' 
  | 'Main Course' 
  | 'Beverages' 
  | 'Desserts' 
  | 'Healthy' 
  | 'Snacks';

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
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
export type PaymentMethod = 'cash-on-delivery' | 'online-payment' | 'pay-at-pickup' | 'pay-at-hotel' | 'add-to-room';
export type OrderStatus = 'confirmed' | 'preparing' | 'out_for_delivery' | 'ready_for_pickup' | 'delivered';

export interface SavedAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  address: string;
  landmark?: string;
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

export interface Order {
  id: string; // e.g. #GV20261019
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  orderType: OrderType;
  deliveryAddress: string;
  landmark?: string;
  customerName: string;
  guestName?: string; // backward compatibility
  roomNumber?: string; // backward compatibility
  phone: string;
  paymentMethod: PaymentMethod;
  paymentSubOption?: 'cash' | 'card' | 'upi';
  status: OrderStatus;
  estimatedTime: string;
  timeline: {
    status: OrderStatus;
    title: string;
    description: string;
    time?: string;
    completed: boolean;
    current?: boolean;
  }[];
}

