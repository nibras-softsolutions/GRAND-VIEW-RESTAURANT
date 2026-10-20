import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../theme/colors';
import { CleanAssets } from '../../theme/assets';
import { useCart } from '../../context/CartContext';
import { FoodItem } from '../../types';

interface SavedScreenProps {
  onSelectItem: (item: any) => void;
  onNavigateToHome?: () => void;
}

const STORAGE_SAVED_KEY = '@grand_view_saved_dishes_v1';

const INITIAL_SAVED_ITEMS = [
  {
    id: 'bs-burger',
    name: 'Cheese Burger',
    price: 220,
    calories: 540,
    prepTime: '15 min',
    asset: CleanAssets.foodCheeseburger,
    category: 'Snacks',
  },
  {
    id: 'food-pepperoni',
    name: 'Pepperoni Feast',
    price: 340,
    calories: 310,
    prepTime: '20 min',
    asset: CleanAssets.foodPepperoni,
    category: 'Snacks',
  },
  {
    id: 'food-friedchicken',
    name: 'Crispy Fried Chicken',
    price: 280,
    calories: 480,
    prepTime: '15 min',
    asset: CleanAssets.foodFriedchicken,
    category: 'Snacks',
  },
];

export const SavedScreen: React.FC<SavedScreenProps> = ({
  onSelectItem,
  onNavigateToHome,
}) => {
  const { addToCart } = useCart();
  const [savedItems, setSavedItems] = useState<any[]>(INITIAL_SAVED_ITEMS);
  const [activeRemoveId, setActiveRemoveId] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    async function loadSaved() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_SAVED_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Restore asset references
            const restored = parsed.map((item) => ({
              ...item,
              asset:
                item.id === 'bs-burger'
                  ? CleanAssets.foodCheeseburger
                  : item.id === 'food-pepperoni'
                  ? CleanAssets.foodPepperoni
                  : CleanAssets.foodFriedchicken,
            }));
            setSavedItems(restored);
          }
        }
      } catch (e) {
        console.warn('Failed to load saved dishes:', e);
      }
    }
    loadSaved();
  }, []);

  const saveToStorage = async (items: any[]) => {
    try {
      // Store without binary assets
      const plain = items.map(({ asset, ...rest }) => rest);
      await AsyncStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(plain));
    } catch (e) {
      console.warn('Failed to save dishes to storage:', e);
    }
  };

  // Delete from saved dishes
  const handleRemove = (item: any) => {
    Alert.alert(
      'Remove Dish',
      `Remove "${item.name}" from your saved dishes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = savedItems.filter((i) => i.id !== item.id);
            setSavedItems(updated);
            saveToStorage(updated);
          },
        },
      ]
    );
  };

  const handleAdd = (item: any) => {
    const foodItem: FoodItem = {
      id: item.id,
      name: item.name,
      category: item.category,
      description: '',
      price: item.price,
      image: '',
      isVeg: false,
      calories: item.calories,
      prepTime: item.prepTime,
    };
    addToCart(foodItem, 1);
    Alert.alert('Added to Cart', `1x ${item.name} added to your cart.`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Saved Dishes</Text>
          <Text style={styles.headerSub}>
            {savedItems.length} {savedItems.length === 1 ? 'favorite' : 'favorites'}
          </Text>
        </View>

        {savedItems.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Clear All', 'Remove all items from your saved dishes?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear All',
                  style: 'destructive',
                  onPress: () => {
                    setSavedItems([]);
                    saveToStorage([]);
                  },
                },
              ]);
            }}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={44} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No saved dishes yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any dish in the restaurant menu to save your favorites here for quick reordering.
            </Text>
            {onNavigateToHome && (
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={onNavigateToHome}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreBtnText}>Explore Restaurant Menu</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          savedItems.map((item) => (
            <View key={item.id} style={styles.cardContainer}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => onSelectItem(item)}
                activeOpacity={0.88}
              >
                <View style={styles.foodImgWrapper}>
                  <Image source={item.asset} style={styles.foodImg} resizeMode="cover" />
                </View>

                <View style={styles.details}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    🔥 {item.calories} Cal • ⏱ {item.prepTime}
                  </Text>
                  <Text style={styles.price}>₹{Number(item.price).toFixed(2)}</Text>
                </View>

                {/* Action Buttons: Add to Cart & Remove */}
                <View style={styles.cardActions}>
                  {/* Add to Cart button */}
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAdd(item)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="bag-add" size={18} color={Colors.white} />
                  </TouchableOpacity>

                  {/* Remove from Saved button (matches design reference) */}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(item)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.white} />
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 30,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.danger,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  foodImgWrapper: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  foodImg: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  meta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 3,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  removeBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 280,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  exploreBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
