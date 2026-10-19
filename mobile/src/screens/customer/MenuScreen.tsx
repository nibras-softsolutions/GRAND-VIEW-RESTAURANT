import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useMenu } from '../../context/MenuContext';
import { useCart } from '../../context/CartContext';
import { CategoryPills } from '../../components/CategoryPills';
import { FoodCard } from '../../components/FoodCard';
import { FoodItem } from '../../types';

interface MenuScreenProps {
  onSelectItem: (item: FoodItem) => void;
  initialCategory?: string;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  onSelectItem,
  initialCategory = 'all',
}) => {
  const {
    categories,
    menuItems,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isLoading,
    refreshMenu,
  } = useMenu();

  const { addToCart, cart } = useCart();
  const [vegOnly, setVegOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMenu();
    setRefreshing(false);
  };

  const getItemQuantityInCart = (itemId: string) => {
    return cart
      .filter((c) => c.foodItem.id === itemId)
      .reduce((sum, c) => sum + c.quantity, 0);
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCategory =
          item.category.toLowerCase() === selectedCategory.toLowerCase() ||
          categories.some(
            (c) =>
              c.id === selectedCategory &&
              c.name.toLowerCase() === item.category.toLowerCase()
          );
        if (!matchesCategory) return false;
      }

      // Veg filter
      if (vegOnly && !item.isVeg) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [menuItems, selectedCategory, vegOnly, searchQuery, categories]);

  return (
    <View style={styles.container}>
      {/* Search & Filter Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search biriyani, seafood, starters..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Veg Only Toggle Button */}
        <TouchableOpacity
          style={[styles.vegFilterBtn, vegOnly && styles.vegFilterBtnActive]}
          onPress={() => setVegOnly(!vegOnly)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.vegDot,
              { backgroundColor: vegOnly ? Colors.white : Colors.veg },
            ]}
          />
          <Text
            style={[
              styles.vegFilterText,
              vegOnly && styles.vegFilterTextActive,
            ]}
          >
            Pure Veg
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Categories */}
      <CategoryPills
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
        showAllOption={true}
      />

      {/* Results Header Count */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCount}>
          {filteredItems.length} {filteredItems.length === 1 ? 'Dish' : 'Dishes'} Available
        </Text>
        {vegOnly && (
          <TouchableOpacity onPress={() => setVegOnly(false)}>
            <Text style={styles.clearFilterText}>Reset Veg Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Items List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading fresh dishes...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No dishes found</Text>
          <Text style={styles.emptySubtitle}>
            Try clearing your search query or selecting a different category.
          </Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setVegOnly(false);
            }}
          >
            <Text style={styles.resetBtnText}>Show All Menu Items</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <FoodCard
              item={item}
              layout="row"
              quantityInCart={getItemQuantityInCart(item.id)}
              onPress={() => onSelectItem(item)}
              onAddToCart={() => addToCart(item, 1)}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    shadowColor: '#1A1814',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    height: '100%',
  },
  vegFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.surface,
  },
  vegFilterBtnActive: {
    backgroundColor: Colors.veg,
    borderColor: Colors.veg,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  vegFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  vegFilterTextActive: {
    color: Colors.white,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  resultsCount: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearFilterText: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
