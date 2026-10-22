import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useMenu } from '../../context/MenuContext';
import { useCart } from '../../context/CartContext';
import { CategoryPills } from '../../components/CategoryPills';
import { FoodCard } from '../../components/FoodCard';
import { FoodItem } from '../../types';

interface HomeScreenProps {
  onNavigateToMenu: (categoryId?: string) => void;
  onSelectItem: (item: FoodItem) => void;
  onNavigateToOrders: () => void;
  onNavigateToCart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToMenu,
  onSelectItem,
  onNavigateToOrders,
  onNavigateToCart,
}) => {
  const {
    categories,
    menuItems,
    popularItems,
    featuredItems,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    refreshMenu,
    settings,
  } = useMenu();

  const { addToCart, cart } = useCart();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMenu();
    setRefreshing(false);
  };

  const isStoreOpen = settings?.general?.isOpen !== false;

  const getItemQuantityInCart = (itemId: string) => {
    return cart
      .filter((c) => c.foodItem.id === itemId)
      .reduce((sum, c) => sum + c.quantity, 0);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Restaurant Status Notice if Closed */}
      {!isStoreOpen && (
        <View style={styles.closedNotice}>
          <Ionicons name="time-outline" size={18} color={Colors.danger} />
          <Text style={styles.closedNoticeText}>
            Restaurant is currently closed for orders.{' '}
            {settings?.general?.closureNotice || 'We will open shortly.'}
          </Text>
        </View>
      )}

      {/* Hero / Promotional Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroTag}>
            <Ionicons name="sparkles" size={13} color={Colors.primaryDark} />
            <Text style={styles.heroTagText}>Island Gastronomy</Text>
          </View>
          <Text style={styles.heroTitle}>Alfiya Kitchen</Text>
          <Text style={styles.heroSubtitle}>Good Food. Great Moments.</Text>
          <Text style={styles.heroDescription}>
            Authentic coastal delicacies, aromatic biriyanis, and freshly prepared island favorites delivered to your door.
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroPrimaryBtn}
              onPress={() => onNavigateToMenu('all')}
              activeOpacity={0.85}
            >
              <Ionicons name="restaurant-outline" size={16} color={Colors.white} />
              <Text style={styles.heroPrimaryBtnText}>Order Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryBtn}
              onPress={() => onNavigateToMenu('all')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroSecondaryBtnText}>View Full Menu</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Category Horizontal Filter */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <Text style={styles.sectionSubtitle}>
            Browse our chef-crafted selections
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onNavigateToMenu('all')}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <CategoryPills
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={(id) => {
          setSelectedCategory(id);
          onNavigateToMenu(id);
        }}
        showAllOption={true}
      />

      {/* Loading state */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching fresh menu...</Text>
        </View>
      )}

      {/* Popular Items Section */}
      {popularItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Popular Dishes</Text>
              <Text style={styles.sectionSubtitle}>
                Loved by diners across the island
              </Text>
            </View>
          </View>

          <View style={styles.cardsGrid}>
            {popularItems.slice(0, 4).map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                quantityInCart={getItemQuantityInCart(item.id)}
                onPress={() => onSelectItem(item)}
                onAddToCart={() => addToCart(item, 1)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Featured / Chef's Special Section */}
      {featuredItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Chef's Recommendations</Text>
              <Text style={styles.sectionSubtitle}>
                Specially curated signature flavors
              </Text>
            </View>
          </View>

          {featuredItems.slice(0, 3).map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              layout="row"
              quantityInCart={getItemQuantityInCart(item.id)}
              onPress={() => onSelectItem(item)}
              onAddToCart={() => addToCart(item, 1)}
            />
          ))}
        </View>
      )}

      {/* Restaurant Hours & Contact Footer Banner */}
      <View style={styles.infoBanner}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color={Colors.primaryDark} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Kitchen Hours</Text>
            <Text style={styles.infoValue}>
              {settings?.general?.openHours || '10:00 AM – 11:00 PM Daily'}
            </Text>
          </View>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={Colors.primaryDark} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Direct Hotline</Text>
            <Text style={styles.infoValue}>
              {settings?.general?.phone || '+91 94472 00000'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  closedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    gap: 8,
  },
  closedNoticeText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  heroCard: {
    margin: 16,
    borderRadius: 20,
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#38302B',
    overflow: 'hidden',
    shadowColor: '#1A1814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  heroOverlay: {
    padding: 20,
    backgroundColor: 'rgba(28, 25, 23, 0.95)',
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 154, 74, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(201, 154, 74, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 10,
  },
  heroTagText: {
    color: '#E8D2A7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#E8D2A7',
    fontWeight: '600',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  heroDescription: {
    fontSize: 13,
    color: '#D6D3D1',
    lineHeight: 18,
    marginBottom: 16,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  heroPrimaryBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  heroSecondaryBtnText: {
    color: '#E8D2A7',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  cardsGrid: {
    marginTop: 8,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  infoBanner: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F3EFE6',
    marginVertical: 12,
  },
});
