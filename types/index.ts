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

export type OrderStatus = 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';

export interface Order {
  id: string; // e.g. #GH20261016
  createdAt: string;
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
