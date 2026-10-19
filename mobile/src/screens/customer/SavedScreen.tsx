import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { ReferenceAssets } from '../../theme/assets';
import { useCart } from '../../context/CartContext';
import { FoodItem } from '../../types';

interface SavedScreenProps {
  onSelectItem: (item: any) => void;
}

export const SavedScreen: React.FC<SavedScreenProps> = ({ onSelectItem }) => {
  const { addToCart } = useCart();

  const savedItems = [
    {
      id: 'bs-1',
      name: 'Cheese Burger',
      price: 4.99,
      calories: 540,
      prepTime: '15 min',
      asset: ReferenceAssets.foodCheeseburger,
      category: 'Burger',
    },
    {
      id: 'bs-3',
      name: 'Pepperoni Feast',
      price: 11.99,
      calories: 310,
      prepTime: '20 min',
      asset: ReferenceAssets.foodPepperoni,
      category: 'Pizza',
    },
    {
      id: 'bs-8',
      name: 'Crispy Fried Chicken',
      price: 8.49,
      calories: 480,
      prepTime: '15 min',
      asset: ReferenceAssets.foodFriedchicken,
      category: 'Chicken',
    },
  ];

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
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Dishes</Text>
        <Text style={styles.headerSub}>{savedItems.length} favorites</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savedItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => onSelectItem(item)}
            activeOpacity={0.88}
          >
            <Image source={item.asset} style={styles.foodImg} resizeMode="contain" />
            <View style={styles.details}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                🔥 {item.calories} Cal • ⏱ {item.prepTime}
              </Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => handleAdd(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="bag-add-outline" size={18} color={Colors.white} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 90,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEEF1',
  },
  foodImg: {
    width: 65,
    height: 65,
    marginRight: 14,
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
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
