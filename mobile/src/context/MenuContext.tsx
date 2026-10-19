import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, FoodItem, RestaurantSettings } from '../types';
import { fetchMenu, fetchSettings } from '../api/menu';

interface MenuContextType {
  categories: Category[];
  dishes: FoodItem[];
  menuItems: FoodItem[];
  settings: RestaurantSettings | null;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshMenu: () => Promise<void>;
  filteredDishes: FoodItem[];
  popularDishes: FoodItem[];
  popularItems: FoodItem[];
  featuredDishes: FoodItem[];
  featuredItems: FoodItem[];
  isRestaurantOpen: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const CACHE_KEYS = {
  MENU: 'gvr_menu_cache',
  SETTINGS: 'gvr_settings_cache',
};

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<FoodItem[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached data first for instant mobile startup
  useEffect(() => {
    async function loadCached() {
      try {
        const cachedMenuStr = await AsyncStorage.getItem(CACHE_KEYS.MENU);
        if (cachedMenuStr) {
          const parsed = JSON.parse(cachedMenuStr);
          if (parsed.categories) setCategories(parsed.categories);
          if (parsed.dishes) setDishes(parsed.dishes);
        }

        const cachedSettings = await AsyncStorage.getItem(CACHE_KEYS.SETTINGS);
        if (cachedSettings) {
          setSettings(JSON.parse(cachedSettings));
        }
      } catch (e) {
        console.warn('Failed to load menu from cache', e);
      }
    }
    loadCached();
  }, []);

  const loadLiveMenu = useCallback(async () => {
    try {
      setError(null);
      const [menuRes, settingsRes] = await Promise.all([
        fetchMenu().catch(() => null),
        fetchSettings().catch(() => null),
      ]);

      if (menuRes && menuRes.categories && menuRes.categories.length > 0) {
        setCategories(menuRes.categories);
      }
      if (menuRes && menuRes.dishes && menuRes.dishes.length > 0) {
        setDishes(menuRes.dishes);
      }

      if (settingsRes) {
        setSettings(settingsRes);
        AsyncStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(settingsRes)).catch(() => {});
      }

      if (menuRes && (menuRes.categories || menuRes.dishes)) {
        AsyncStorage.setItem(CACHE_KEYS.MENU, JSON.stringify(menuRes)).catch(() => {});
      }
    } catch (err: any) {
      console.warn('Network error loading menu, falling back to cache:', err);
      setError('Unable to reach server. Showing cached menu.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLiveMenu();
  }, [loadLiveMenu]);

  const refreshMenu = async () => {
    setIsRefreshing(true);
    await loadLiveMenu();
  };

  // Filtered dishes
  const filteredDishes = dishes.filter((d) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      d.category.toLowerCase() === selectedCategory.toLowerCase() ||
      categories.some(
        (c) => c.id === selectedCategory && c.name.toLowerCase() === d.category.toLowerCase()
      );

    const matchesSearch =
      !searchQuery.trim() ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const popularDishes = dishes.filter((d) => d.popular || d.rating! >= 4.7);
  const featuredDishes = dishes.filter((d) => d.chefPick);
  const isRestaurantOpen = settings?.general?.isOpen !== false;

  return (
    <MenuContext.Provider
      value={{
        categories,
        dishes,
        menuItems: dishes,
        settings,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isLoading,
        isRefreshing,
        error,
        refreshMenu,
        filteredDishes,
        popularDishes,
        popularItems: popularDishes,
        featuredDishes,
        featuredItems: featuredDishes,
        isRestaurantOpen,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
};
