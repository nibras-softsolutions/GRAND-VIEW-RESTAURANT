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
import { CleanAssets } from '../../theme/assets';
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
  const { cart, addToCart } = useCart();
  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = cart.reduce((s, i) => s + (i.foodItem.price || 0) * i.quantity, 0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Categories matching live Grand View Restaurant categories + popular tags
  const categories = [
    { id: 'All', name: 'All', asset: null, isAll: true },
    { id: 'Starters', name: 'Starters', asset: CleanAssets.catStarters },
    { id: 'Main Course', name: 'Main Course', asset: CleanAssets.catMainCourse },
    { id: 'Beverages', name: 'Beverages', asset: CleanAssets.catBeverages },
    { id: 'Desserts', name: 'Desserts', asset: CleanAssets.catDesserts },
    { id: 'Healthy', name: 'Healthy', asset: CleanAssets.catHealthy },
    { id: 'Snacks', name: 'Snacks', asset: CleanAssets.catSnacks },
    { id: 'Burger', name: 'Burgers', asset: CleanAssets.catBurger },
    { id: 'Pizza', name: 'Pizza', asset: CleanAssets.catPizza },
  ];

  // Best Sellers with real, standalone clean food photography from Grand View Restaurant
  const bestSellers = [
    {
      id: 'butter-chicken',
      name: 'Old Delhi Butter Chicken',
      price: 320,
      category: 'Main Course',
      calories: 520,
      prepTime: '20-25 mins',
      asset: CleanAssets.dishButterChicken,
      description: 'Tender chicken tikka slow-simmered in a velvety San Marzano tomato & dairy butter makhani gravy with crushed fenugreek leaves and fresh cream.',
    },
    {
      id: 'biryani',
      name: 'Dum Pukht Chicken Biryani',
      price: 280,
      category: 'Main Course',
      calories: 680,
      prepTime: '25-30 mins',
      asset: CleanAssets.dishBiryani,
      description: 'Aged long-grain basmati rice layered with spiced marinated chicken, saffron milk, fried caramelised onions, and royal spices slow-cooked under dough seal.',
    },
    {
      id: 'chicken-tikka',
      name: 'Tandoori Chicken Tikka',
      price: 260,
      category: 'Starters',
      calories: 380,
      prepTime: '15-20 mins',
      asset: CleanAssets.dishChickenTikka,
      description: 'Succulent boneless chicken chunks marinated in hung curd, Kashmiri red chili, roasted cumin, and tandoori aromatics, charred over live charcoal coals.',
    },
    {
      id: 'paneer-tikka',
      name: 'Paneer Tikka Shashlik',
      price: 240,
      category: 'Starters',
      calories: 320,
      prepTime: '15 mins',
      asset: CleanAssets.dishPaneerTikka,
      description: 'Char-grilled fresh cottage cheese cubes layered with crisp bell peppers, Spanish onions, and ground spices, served with fresh mint chutney.',
    },
    {
      id: 'artisan-flatbread',
      name: 'Burrata & Tomato Flatbread',
      price: 320,
      category: 'Snacks',
      calories: 460,
      prepTime: '15-20 mins',
      asset: CleanAssets.dishFlatbread,
      description: 'Hand-stretched sourdough flatbread topped with San Marzano marinara, creamy Italian burrata cheese, blistered cherry tomatoes, and fresh basil.',
    },
    {
      id: 'french-fries',
      name: 'Truffle Seasoned Fries',
      price: 120,
      category: 'Snacks',
      calories: 280,
      prepTime: '10-15 mins',
      asset: CleanAssets.dishFrenchFries,
      description: 'Crispy golden hand-cut potatoes tossed with white truffle sea salt, cracked peppercorns, and thyme, served with smoked tomato ketchup and garlic aioli.',
    },
    {
      id: 'club-sandwich',
      name: 'Grand Club Sandwich',
      price: 220,
      category: 'Snacks',
      calories: 520,
      prepTime: '15-20 mins',
      asset: CleanAssets.dishClubSandwich,
      description: 'Triple-decker toasted artisan bread with smoked chicken breast, farm egg, aged cheddar, heirloom tomatoes, and crisp lettuce with seasoned fries.',
    },
    {
      id: 'fresh-lime-soda',
      name: 'Fresh Key Lime Soda',
      price: 90,
      category: 'Beverages',
      calories: 60,
      prepTime: '5-10 mins',
      asset: CleanAssets.dishFreshLimeSoda,
      description: 'Chilled sparkling club soda with freshly squeezed Key limes, pink Himalayan mineral salt, fresh spearmint, and organic cane sugar.',
    },
    {
      id: 'mango-lassi',
      name: 'Alphonso Mango Lassi',
      price: 130,
      category: 'Beverages',
      calories: 220,
      prepTime: '5-10 mins',
      asset: CleanAssets.dishMangoLassi,
      description: 'Fresh Ratnagiri Alphonso mango pulp churned with chilled organic yoghurt, green cardamom, and toasted slivered pistachios.',
    },
    {
      id: 'lava-cake',
      name: 'Chocolate Lava Cake',
      price: 160,
      category: 'Desserts',
      calories: 410,
      prepTime: '12 mins',
      asset: CleanAssets.dishLavaCake,
      description: 'Decadent warm dark chocolate cake with a molten chocolate ganache center, lightly dusted with powdered sugar and cocoa.',
    },
    {
      id: 'tiramisu',
      name: 'Espresso Tiramisu',
      price: 180,
      category: 'Desserts',
      calories: 350,
      prepTime: '10 mins',
      asset: CleanAssets.dishTiramisu,
      description: 'Classic Italian ladyfinger biscuits soaked in single-estate espresso and layered with whipped mascarpone cream and cocoa.',
    },
    {
      id: 'rogan-josh',
      name: 'Mutton Rogan Josh',
      price: 380,
      category: 'Main Course',
      calories: 610,
      prepTime: '25-30 mins',
      asset: CleanAssets.dishRoganJosh,
      description: 'Traditional slow-braised Kashmiri mutton shank cooked with ratanjot, Kashmiri chilies, fennel, and aromatic spices until fall-apart tender.',
    },
    {
      id: 'dal-makhani',
      name: 'Dal Makhani Grand View',
      price: 220,
      category: 'Main Course',
      calories: 420,
      prepTime: '20 mins',
      asset: CleanAssets.dishDalMakhani,
      description: 'Whole black urad lentils slow-simmered over live charcoal for 16 hours with churned white butter, tomatoes, and organic cream.',
    },
    {
      id: 'paneer-butter-masala',
      name: 'Shahi Paneer Butter Masala',
      price: 250,
      category: 'Main Course',
      calories: 480,
      prepTime: '20 mins',
      asset: CleanAssets.dishPaneerButterMasala,
      description: 'Fresh soft cottage cheese cubes simmered in a mildly sweet and spicy royal cashew-tomato makhani gravy infused with saffron.',
    },
    {
      id: 'bs-burger',
      name: 'Grand Cheese Burger',
      price: 180,
      category: 'Snacks',
      calories: 540,
      prepTime: '15 mins',
      asset: CleanAssets.foodCheeseburger,
      description: 'Grilled artisan patty layered with melted aged cheddar, crisp butter lettuce, and house-made burger glaze on a toasted brioche bun.',
    },
    {
      id: 'bs-chicken',
      name: 'Crispy Fried Chicken',
      price: 240,
      category: 'Starters',
      calories: 480,
      prepTime: '15 mins',
      asset: CleanAssets.foodFriedchicken,
      description: 'Golden, extra-crunchy buttermilk chicken marinated in 11 aromatic spices and fried to juicy perfection with herb garlic aioli.',
    },
  ];

  // Order Again dishes with clean standalone food imagery
  const orderAgainItems = [
    {
      id: 'oa-1',
      name: 'Butter Chicken',
      timeText: 'Yesterday · ₹320',
      asset: CleanAssets.dishButterChicken,
      price: 320,
      category: 'Main Course',
      calories: 520,
      prepTime: '20 mins',
    },
    {
      id: 'oa-2',
      name: 'Chicken Biryani',
      timeText: '3 days ago · ₹280',
      asset: CleanAssets.dishBiryani,
      price: 280,
      category: 'Main Course',
      calories: 680,
      prepTime: '25 mins',
    },
    {
      id: 'oa-3',
      name: 'Tandoori Tikka',
      timeText: 'Last week · ₹260',
      asset: CleanAssets.dishChickenTikka,
      price: 260,
      category: 'Starters',
      calories: 380,
      prepTime: '15 mins',
    },
  ];

  const handleAddFood = (item: any) => {
    const foodItem: FoodItem = {
      id: item.id,
      name: item.name,
      category: item.category || 'Dishes',
      description: item.description || '',
      price: item.price,
      image: '',
      isVeg: item.category === 'Beverages' || item.category === 'Desserts' || item.name.includes('Paneer') || item.name.includes('Dal'),
      calories: item.calories,
      prepTime: item.prepTime,
    };
    addToCart(foodItem, 1);
  };

  const filteredBestSellers = selectedCategory === 'All'
    ? bestSellers
    : bestSellers.filter((b) => b.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(b.category.toLowerCase()));

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          cart.length > 0 && { paddingBottom: 160 },
        ]}
        showsVerticalScrollIndicator={false}
      >
      {/* 1. Top Curved Emerald Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={onOpenAddressSelector}
            activeOpacity={0.8}
          >
            <Image
              source={CleanAssets.userAvatar}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationContainer}
            onPress={onOpenAddressSelector}
            activeOpacity={0.8}
          >
            <View style={styles.deliverToRow}>
              <Ionicons name="location-outline" size={13} color="#D2F6B1" />
              <Text style={styles.deliverToText}>Deliver to · Lakshadweep</Text>
            </View>
            <View style={styles.addressRow}>
              <Text style={styles.addressTitle}>Home </Text>
              <Text style={styles.addressDetail} numberOfLines={1}>
                Beach Road, Kavaratti Island
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

      {/* 2. Standalone Production Promotional Hero Banner */}
      <View style={styles.promoContainer}>
        <View style={styles.promoCard}>
          <Image
            source={CleanAssets.feastBanner}
            style={styles.promoBackgroundImage}
            resizeMode="cover"
          />
          {/* Subtle dark gradient overlay for text readability */}
          <View style={styles.promoGradientOverlay} />

          <View style={styles.promoContent}>
            <View style={styles.promoBadge}>
              <Ionicons name="flash" size={11} color="#10B981" />
              <Text style={styles.promoBadgeText}>CHEF'S SIGNATURE</Text>
            </View>

            <Text style={styles.promoTitle}>FAST & FREE{'\n'}DELIVERY!</Text>
            <Text style={styles.promoSubtitle}>Zero delivery fee on orders over ₹499 · Code: FREESHIP</Text>

            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => setSelectedCategory('All')}
              activeOpacity={0.85}
            >
              <Text style={styles.promoButtonText}>Order Now</Text>
              <Ionicons name="arrow-forward" size={12} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 3. Categories Horizontal Scroll */}
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
              <View
                style={[
                  styles.categoryIconCircle,
                  isSelected && styles.categoryIconCircleActive,
                ]}
              >
                {cat.isAll ? (
                  <Ionicons
                    name="grid"
                    size={22}
                    color={isSelected ? Colors.white : Colors.primary}
                  />
                ) : (
                  <Image
                    source={cat.asset}
                    style={styles.categoryAssetImage}
                    resizeMode="cover"
                  />
                )}
              </View>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive,
                ]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 4. Order Again Section */}
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
            <View style={styles.orderAgainImageContainer}>
              <Image
                source={item.asset}
                style={styles.orderAgainImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.orderAgainDetails}>
              <Text style={styles.orderAgainName} numberOfLines={1}>
                {item.name}
              </Text>
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

      {/* 5. Deals For You Section (Standalone high-res deal cards) */}
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
        <View style={[styles.dealCard, { backgroundColor: '#7F1D1D' }]}>
          <View style={styles.dealTextSide}>
            <View style={styles.dealTag}>
              <Text style={styles.dealTagText}>SPECIAL</Text>
            </View>
            <Text style={styles.dealHeadline}>30% OFF</Text>
            <Text style={styles.dealSubtext}>Tandoori & Starters Platter</Text>

            <TouchableOpacity
              style={[
                styles.dealActionBtn,
                appliedCoupon === 'GRAND30' && styles.dealActionBtnApplied,
              ]}
              onPress={() => setAppliedCoupon(appliedCoupon === 'GRAND30' ? null : 'GRAND30')}
              activeOpacity={0.8}
            >
              <Text style={styles.dealActionBtnText}>
                {appliedCoupon === 'GRAND30' ? 'APPLIED ✓' : 'USE GRAND30'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dealImageSide}>
            <Image
              source={CleanAssets.dishChickenTikka}
              style={styles.dealHeroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Deal 2: Free Delivery */}
        <View style={[styles.dealCard, { backgroundColor: '#064E3B' }]}>
          <View style={styles.dealTextSide}>
            <View style={[styles.dealTag, { backgroundColor: '#059669' }]}>
              <Text style={styles.dealTagText}>ISLAND-WIDE</Text>
            </View>
            <Text style={styles.dealHeadline}>FREE DELIVERY</Text>
            <Text style={styles.dealSubtext}>Orders over ₹499 in Lakshadweep</Text>

            <TouchableOpacity
              style={[
                styles.dealActionBtn,
                appliedCoupon === 'FREESHIP' && styles.dealActionBtnApplied,
              ]}
              onPress={() => setAppliedCoupon(appliedCoupon === 'FREESHIP' ? null : 'FREESHIP')}
              activeOpacity={0.8}
            >
              <Text style={styles.dealActionBtnText}>
                {appliedCoupon === 'FREESHIP' ? 'APPLIED ✓' : 'USE FREESHIP'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dealImageSide}>
            <Image
              source={CleanAssets.courierHero}
              style={styles.dealHeroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Deal 3: Royal Biryani Feast */}
        <View style={[styles.dealCard, { backgroundColor: '#78350F' }]}>
          <View style={styles.dealTextSide}>
            <View style={[styles.dealTag, { backgroundColor: '#D97706' }]}>
              <Text style={styles.dealTagText}>COMBO</Text>
            </View>
            <Text style={styles.dealHeadline}>ROYAL FEAST</Text>
            <Text style={styles.dealSubtext}>Chicken Biryani + Fresh Lime Soda</Text>

            <TouchableOpacity
              style={[
                styles.dealActionBtn,
                appliedCoupon === 'FEAST20' && styles.dealActionBtnApplied,
              ]}
              onPress={() => setAppliedCoupon(appliedCoupon === 'FEAST20' ? null : 'FEAST20')}
              activeOpacity={0.8}
            >
              <Text style={styles.dealActionBtnText}>
                {appliedCoupon === 'FEAST20' ? 'APPLIED ✓' : 'USE FEAST20'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dealImageSide}>
            <Image
              source={CleanAssets.dishBiryani}
              style={styles.dealHeroImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </ScrollView>

      {/* 6. Best Sellers 2-Column Grid */}
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
            {/* Title & Price in INR */}
            <Text style={styles.foodTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.foodPrice}>₹{item.price}</Text>

            {/* Standalone Sharp Food Photo */}
            <View style={styles.foodImageContainer}>
              <Image
                source={item.asset}
                style={styles.foodAssetImage}
                resizeMode="cover"
              />
            </View>

            {/* Meta Row: Calories, Prep Time, + Add Button */}
            <View style={styles.foodMetaRow}>
              <View style={styles.metaLeft}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaEmoji}>🔥</Text>
                  <Text style={styles.metaText}>{item.calories} cal</Text>
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
                <Ionicons name="add" size={17} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>

      {/* Floating Sticky Cart / Checkout Bar */}
      {cart.length > 0 && (
        <View style={styles.stickyCartBar}>
          <View style={styles.stickyCartLeft}>
            <View style={styles.stickyCartIconBadge}>
              <Ionicons name="bag-handle" size={18} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.stickyCartCount}>
                {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in cart
              </Text>
              <Text style={styles.stickyCartTotal}>
                ₹{cartSubtotal.toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.stickyCartBtn}
            onPress={onNavigateToCart}
            activeOpacity={0.85}
          >
            <Text style={styles.stickyCartBtnText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={15} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFBFB',
    position: 'relative',
  },
  stickyCartBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 86 : 72,
    left: 16,
    right: 16,
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  stickyCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stickyCartIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyCartCount: {
    color: '#D2F6B1',
    fontSize: 11,
    fontWeight: '600',
  },
  stickyCartTotal: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  stickyCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stickyCartBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    maxWidth: 160,
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

  // Promo Banner
  promoContainer: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  promoCard: {
    height: 148,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F2E24',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promoBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  promoGradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(10, 35, 25, 0.72)',
  },
  promoContent: {
    padding: 18,
    justifyContent: 'center',
    flex: 1,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  promoBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  promoSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    marginBottom: 10,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  promoButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 12,
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
    color: Colors.primary,
  },

  // Categories
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: 76,
    height: 98,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  categoryIconCircleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  categoryAssetImage: {
    width: '100%',
    height: '100%',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },

  // Order Again
  orderAgainScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  orderAgainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    width: 230,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  orderAgainImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  orderAgainImage: {
    width: '100%',
    height: '100%',
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

  // Deals
  dealsScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  dealCard: {
    width: 290,
    height: 136,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  dealTextSide: {
    flex: 1.2,
    padding: 14,
    justifyContent: 'space-between',
  },
  dealTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dealTagText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dealHeadline: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.2,
    marginTop: 4,
  },
  dealSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  dealActionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginTop: 6,
  },
  dealActionBtnApplied: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  dealActionBtnText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dealImageSide: {
    flex: 0.9,
    height: '100%',
  },
  dealHeroImage: {
    width: '100%',
    height: '100%',
  },

  // Best Sellers Grid
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
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
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
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '800',
    marginBottom: 8,
  },
  foodImageContainer: {
    height: 108,
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  foodAssetImage: {
    width: '100%',
    height: '100%',
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
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
});
