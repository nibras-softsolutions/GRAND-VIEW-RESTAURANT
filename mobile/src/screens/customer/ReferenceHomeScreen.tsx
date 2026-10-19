import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { ReferenceAssets } from '../../theme/assets';
import { useCart } from '../../context/CartContext';
import { FoodItem } from '../../types';

interface ReferenceHomeScreenProps {
  onSelectItem: (item: any) => void;
  onNavigateToCart: () => void;
  onOpenAddressSelector?: () => void;
  onOpenNotifications?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

export const ReferenceHomeScreen: React.FC<ReferenceHomeScreenProps> = ({
  onSelectItem,
  onNavigateToCart,
  onOpenAddressSelector,
  onOpenNotifications,
}) => {
  const { addToCart, cart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Categories matching frames 078-088
  const categories = [
    { id: 'All', name: 'All', asset: null, isAll: true },
    { id: 'Burger', name: 'Burger', asset: ReferenceAssets.catBurger },
    { id: 'Pizza', name: 'Pizza', asset: ReferenceAssets.catPizza },
    { id: 'Sushi', name: 'Sushi', asset: ReferenceAssets.catSushi },
    { id: 'Chicken', name: 'Chicken', asset: ReferenceAssets.catChicken },
    { id: 'Meat', name: 'Meat', asset: ReferenceAssets.catMeat },
    { id: 'Noodles', name: 'Noodles', asset: ReferenceAssets.catNoodles },
    { id: 'Pasta', name: 'Pasta', asset: ReferenceAssets.catPasta },
    { id: 'Dessert', name: 'Dessert', asset: ReferenceAssets.catDessert },
    { id: 'Drinks', name: 'Drinks', asset: ReferenceAssets.catDrinks },
  ];

  // Best Sellers (frames 090 - 100)
  const bestSellers = [
    {
      id: 'bs-1',
      name: 'Cheese Burger',
      price: 4.99,
      category: 'Burger',
      calories: 540,
      prepTime: '15 min',
      asset: ReferenceAssets.foodCheeseburger,
      description: 'Juicy beef patty layered with melted cheddar cheese, fresh crisp lettuce, and special burger sauce.',
    },
    {
      id: 'bs-2',
      name: 'Burger & Fries Combo',
      price: 7.99,
      category: 'Burger',
      calories: 920,
      prepTime: '15 min',
      asset: ReferenceAssets.foodCombo,
      description: 'Classic double beef cheeseburger served with hot golden salted french fries and dip.',
    },
    {
      id: 'bs-3',
      name: 'Pepperoni Feast',
      price: 11.99,
      category: 'Pizza',
      calories: 310,
      prepTime: '20 min',
      asset: ReferenceAssets.foodPepperoni,
      description: 'Stone-baked pizza crust smothered in rich tomato sauce, premium mozzarella, and spicy beef pepperoni.',
    },
    {
      id: 'bs-4',
      name: 'Cheesy Garlic Bread',
      price: 3.90,
      category: 'Pizza',
      calories: 280,
      prepTime: '12 min',
      asset: ReferenceAssets.foodGarlicbread,
      description: 'Crispy toasted baguette filled with herb butter, garlic confit, and golden bubbling cheese.',
    },
    {
      id: 'bs-5',
      name: 'Sushi Bento Box',
      price: 14.90,
      category: 'Sushi',
      calories: 610,
      prepTime: '25 min',
      asset: ReferenceAssets.foodSushibento,
      description: 'Assorted fresh nigiri, tuna maki rolls, steamed edamame, and pickled ginger.',
    },
    {
      id: 'bs-6',
      name: 'Salmon Avocado Maki',
      price: 13.90,
      category: 'Sushi',
      calories: 420,
      prepTime: '20 min',
      asset: ReferenceAssets.foodSalmonmaki,
      description: 'Silky Atlantic salmon paired with ripe avocado rolled in nori seaweed and seasoned sushi rice.',
    },
    {
      id: 'bs-7',
      name: 'Prawn Tempura',
      price: 11.90,
      category: 'Sushi',
      calories: 380,
      prepTime: '18 min',
      asset: ReferenceAssets.foodTempura,
      description: 'Jumbo tiger prawns fried in a featherlight Japanese tempura batter with sweet dipping sauce.',
    },
    {
      id: 'bs-8',
      name: 'Crispy Fried Chicken',
      price: 8.49,
      category: 'Chicken',
      calories: 480,
      prepTime: '15 min',
      asset: ReferenceAssets.foodFriedchicken,
      description: 'Golden, extra-crunchy chicken marinated in 11 aromatic spices and fried to juicy perfection.',
    },
    {
      id: 'bs-9',
      name: 'Hot & Spicy Bucket',
      price: 18.90,
      category: 'Chicken',
      calories: 1240,
      prepTime: '20 min',
      asset: ReferenceAssets.foodSpicybucket,
      description: 'A feast of 8 crispy chicken pieces coated in fiery chili seasoning with garlic dipping sauce.',
    },
    {
      id: 'bs-10',
      name: 'Crispy Chicken Wrap',
      price: 6.49,
      category: 'Chicken',
      calories: 520,
      prepTime: '12 min',
      asset: ReferenceAssets.foodWrap,
      description: 'Warm toasted tortilla wrapped around crunchy fried chicken tenders, shredded lettuce, and mayo.',
    },
    {
      id: 'bs-11',
      name: 'Herb Roast Chicken',
      price: 13.90,
      category: 'Chicken',
      calories: 980,
      prepTime: '35 min',
      asset: ReferenceAssets.foodRoastchicken,
      description: 'Slow-roasted half chicken seasoned with fresh rosemary, thyme, garlic, and cracked pepper.',
    },
    {
      id: 'bs-12',
      name: 'Grilled Ribeye Steak',
      price: 24.90,
      category: 'Meat',
      calories: 690,
      prepTime: '35 min',
      asset: ReferenceAssets.foodSteak,
      description: 'Prime cut ribeye steak grilled over open fire, served with sautéed mushrooms and herb butter.',
    },
    {
      id: 'bs-13',
      name: 'Classic Hot Dog',
      price: 3.99,
      category: 'Meat',
      calories: 380,
      prepTime: '10 min',
      asset: ReferenceAssets.foodHotdog,
      description: 'Smoked frankfurter in a soft warm bun, topped with yellow mustard, ketchup, and relish.',
    },
    {
      id: 'bs-14',
      name: 'Beef Kebab Skewers',
      price: 10.90,
      category: 'Meat',
      calories: 450,
      prepTime: '20 min',
      asset: ReferenceAssets.foodKebab,
      description: 'Flame-grilled spiced ground beef skewers served with charred bell peppers and yogurt sauce.',
    },
  ];

  // Order Again dishes (frame 085)
  const orderAgainItems = [
    {
      id: 'oa-1',
      name: 'Cheese Burger',
      timeText: 'Yesterday · $4.99',
      asset: ReferenceAssets.foodCheeseburger,
      price: 4.99,
    },
    {
      id: 'oa-2',
      name: 'Tonkotsu Ramen',
      timeText: '3 days ago · $12.50',
      asset: ReferenceAssets.catNoodles || ReferenceAssets.foodSushibento,
      price: 12.50,
    },
  ];

  // Fast Delivery items (frame 090)
  const fastDeliveryItems = [
    {
      id: 'fd-1',
      name: 'Classic Cola',
      price: 1.90,
      calories: 140,
      prepTime: '5 min',
      category: 'Drinks',
    },
    {
      id: 'fd-2',
      name: 'Iced Caramel Latte',
      price: 4.90,
      calories: 190,
      prepTime: '8 min',
      category: 'Drinks',
    },
    {
      id: 'fd-3',
      name: 'Strawberry Shake',
      price: 5.20,
      calories: 260,
      prepTime: '8 min',
      category: 'Drinks',
    },
  ];

  const handleAddFood = (item: any) => {
    // Transform to FoodItem shape for the cart context
    const foodItem: FoodItem = {
      id: item.id,
      name: item.name,
      category: item.category || 'Dishes',
      description: item.description || '',
      price: item.price,
      image: '',
      isVeg: item.category === 'Drinks' || item.category === 'Dessert',
      calories: item.calories,
      prepTime: item.prepTime,
    };
    addToCart(foodItem, 1);
  };

  const filteredBestSellers = selectedCategory === 'All'
    ? bestSellers
    : bestSellers.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Top Curved Green Header (Matches frames 078-100) */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={onOpenAddressSelector}
            activeOpacity={0.8}
          >
            <Image
              source={ReferenceAssets.userAvatar}
              style={styles.avatarImage}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationContainer}
            onPress={onOpenAddressSelector}
            activeOpacity={0.8}
          >
            <View style={styles.deliverToRow}>
              <Ionicons name="location-outline" size={12} color="#D2F6B1" />
              <Text style={styles.deliverToText}>Deliver to</Text>
            </View>
            <View style={styles.addressRow}>
              <Text style={styles.addressTitle}>Home </Text>
              <Text style={styles.addressDetail} numberOfLines={1}>
                12 Jalan Ampang, Kuala L...
              </Text>
              <Ionicons name="chevron-down" size={13} color={Colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.bellButton}
          onPress={onOpenNotifications}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={Colors.white} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      {/* 2. Promotional Banner (FAST & FREE DELIVERY!) */}
      <View style={styles.promoWrapper}>
        <Image
          source={ReferenceAssets.promoBanner}
          style={styles.promoBannerImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.orderNowClickArea}
          onPress={() => setSelectedCategory('All')}
          activeOpacity={0.85}
        />
      </View>

      {/* 3. Categories Horizontal Scroll (Matches frames 080-088) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => setSelectedCategory('All')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                isSelected && styles.categoryCardActive,
              ]}
              onPress={() => setSelectedCategory(cat.name)}
              activeOpacity={0.8}
            >
              <View style={styles.categoryIconContainer}>
                {cat.isAll ? (
                  <View style={styles.allIconPlaceholder}>
                    <Ionicons
                      name="fast-food"
                      size={26}
                      color={isSelected ? Colors.white : Colors.primaryDark}
                    />
                  </View>
                ) : (
                  <Image
                    source={cat.asset}
                    style={styles.categoryAssetImage}
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 4. Order again Section (frame 085) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Order again</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.orderAgainScroll}
      >
        {orderAgainItems.map((item) => (
          <View key={item.id} style={styles.orderAgainCard}>
            <Image
              source={item.asset}
              style={styles.orderAgainImage}
              resizeMode="contain"
            />
            <View style={styles.orderAgainDetails}>
              <Text style={styles.orderAgainName}>{item.name}</Text>
              <Text style={styles.orderAgainTime}>{item.timeText}</Text>
            </View>
            <TouchableOpacity
              style={styles.reorderBtn}
              onPress={() => handleAddFood(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="repeat" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 5. Deals for you Section (frame 085) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Deals for you</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dealsScroll}
      >
        {/* Deal 1: 30% OFF */}
        <View style={styles.dealCard}>
          <Image
            source={ReferenceAssets.dealPizza}
            style={styles.dealImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.dealApplyArea}
            onPress={() => setAppliedCoupon('FOODIE30')}
            activeOpacity={0.8}
          >
            {appliedCoupon === 'FOODIE30' && (
              <View style={styles.appliedPill}>
                <Text style={styles.appliedPillText}>APPLIED</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Deal 2: Free Delivery */}
        <View style={styles.dealCard}>
          <Image
            source={ReferenceAssets.dealFree}
            style={styles.dealImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.dealApplyArea}
            onPress={() => setAppliedCoupon('FREESHIP')}
            activeOpacity={0.8}
          >
            {appliedCoupon === 'FREESHIP' && (
              <View style={styles.appliedPill}>
                <Text style={styles.appliedPillText}>APPLIED</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 6. Best Sellers 2-Column Grid (Frames 090 - 100) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Best Sellers</Text>
        <TouchableOpacity onPress={() => setSelectedCategory('All')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {filteredBestSellers.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.foodGridCard}
            onPress={() => onSelectItem(item)}
            activeOpacity={0.9}
          >
            {/* Title & Price */}
            <Text style={styles.foodTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>

            {/* Food 3D Illustration */}
            <View style={styles.foodImageContainer}>
              <Image
                source={item.asset}
                style={styles.foodAssetImage}
                resizeMode="contain"
              />
            </View>

            {/* Meta Row: Calories, Prep Time, + Add Button */}
            <View style={styles.foodMetaRow}>
              <View style={styles.metaLeft}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaEmoji}>🔥</Text>
                  <Text style={styles.metaText}>{item.calories} Calories</Text>
                </View>

                <View style={styles.metaBadge}>
                  <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{item.prepTime}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.plusButton}
                onPress={() => handleAddFood(item)}
                activeOpacity={0.75}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  content: {
    paddingBottom: 90,
  },
  topHeader: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  locationContainer: {
    flex: 1,
  },
  deliverToRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliverToText: {
    fontSize: 11,
    color: '#D2F6B1',
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  addressDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: 140,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  promoWrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
    height: 140,
    backgroundColor: '#E7F7DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  promoBannerImage: {
    width: '100%',
    height: '100%',
  },
  orderNowClickArea: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    width: 100,
    height: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryCard: {
    width: 72,
    height: 92,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  allIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryAssetImage: {
    width: 38,
    height: 38,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  orderAgainScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  orderAgainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    width: 220,
    gap: 10,
  },
  orderAgainImage: {
    width: 44,
    height: 44,
  },
  orderAgainDetails: {
    flex: 1,
  },
  orderAgainName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  orderAgainTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  reorderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dealCard: {
    width: 240,
    height: 105,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E1E1E',
  },
  dealImage: {
    width: '100%',
    height: '100%',
  },
  dealApplyArea: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appliedPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  appliedPillText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 4,
  },
  foodGridCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 4,
  },
  foodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  foodPrice: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 8,
  },
  foodImageContainer: {
    height: 90,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  foodAssetImage: {
    width: 82,
    height: 82,
  },
  foodMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaLeft: {
    gap: 3,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaEmoji: {
    fontSize: 10,
  },
  metaText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});
