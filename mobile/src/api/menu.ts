import { apiRequest } from './client';
import { Category, FoodItem, RestaurantSettings } from '../types';

export interface MenuResponse {
  categories: Category[];
  dishes: FoodItem[];
}

export async function fetchMenu(): Promise<MenuResponse> {
  return apiRequest<MenuResponse>('/api/menu');
}

export async function fetchSettings(): Promise<RestaurantSettings> {
  return apiRequest<RestaurantSettings>('/api/settings');
}
