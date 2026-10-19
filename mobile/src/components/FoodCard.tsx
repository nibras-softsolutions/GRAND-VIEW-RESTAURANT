import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FoodItem } from '../types';

interface FoodCardProps {
  item: FoodItem;
  quantityInCart?: number;
  onPress: () => void;
  onAddToCart: () => void;
  layout?: 'card' | 'row';
}

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  quantityInCart = 0,
  onPress,
  onAddToCart,
  layout = 'card',
}) => {
  const hasDiscount = !!item.discountPrice && item.discountPrice < item.price;
  const currentPrice = hasDiscount ? item.discountPrice! : item.price;

  // Fallback image URL
  const imageUri = item.image && item.image.startsWith('http')
    ? item.image
    : item.image && item.image.startsWith('/')
    ? `https://grand-view-restaurant.vercel.app${item.image}`
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

  if (layout === 'row') {
    return (
      <TouchableOpacity
        style={styles.rowCard}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.rowImage}
          resizeMode="cover"
        />

        <View style={styles.rowContent}>
          <View style={styles.headerRow}>
            {/* Veg / Non-Veg dot */}
            <View
              style={[
                styles.dietaryIndicator,
                { borderColor: item.isVeg ? Colors.veg : Colors.nonVeg },
              ]}
            >
              <View
                style={[
                  styles.dietaryDot,
                  { backgroundColor: item.isVeg ? Colors.veg : Colors.nonVeg },
                ]}
              />
            </View>

            {item.popular && (
              <View style={styles.badgePopular}>
                <Ionicons name="flame" size={10} color="#B45309" />
                <Text style={styles.badgePopularText}>Popular</Text>
              </View>
            )}
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          {item.description ? (
            <Text style={styles.rowDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.bottomRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{currentPrice}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>₹{item.price}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                quantityInCart > 0 && styles.addButtonActive,
              ]}
              onPress={onAddToCart}
              activeOpacity={0.8}
            >
              <Ionicons
                name={quantityInCart > 0 ? 'checkmark' : 'add'}
                size={16}
                color={quantityInCart > 0 ? Colors.white : Colors.primaryDark}
              />
              <Text
                style={[
                  styles.addButtonText,
                  quantityInCart > 0 && styles.addButtonTextActive,
                ]}
              >
                {quantityInCart > 0 ? `${quantityInCart} in Cart` : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Default Grid / Vertical Card
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Dietary badge overlay */}
        <View style={styles.badgeOverlay}>
          <View
            style={[
              styles.dietaryIndicator,
              { borderColor: item.isVeg ? Colors.veg : Colors.nonVeg },
            ]}
          >
            <View
              style={[
                styles.dietaryDot,
                { backgroundColor: item.isVeg ? Colors.veg : Colors.nonVeg },
              ]}
            />
          </View>

          {item.popular && (
            <View style={styles.badgePopular}>
              <Ionicons name="flame" size={10} color="#B45309" />
              <Text style={styles.badgePopularText}>Popular</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {item.description || 'Prepared fresh with Grand View culinary herbs & spices.'}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{currentPrice}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{item.price}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              quantityInCart > 0 && styles.addButtonActive,
            ]}
            onPress={onAddToCart}
            activeOpacity={0.8}
          >
            <Ionicons
              name={quantityInCart > 0 ? 'checkmark' : 'add'}
              size={14}
              color={quantityInCart > 0 ? Colors.white : Colors.primaryDark}
            />
            <Text
              style={[
                styles.addButtonText,
                quantityInCart > 0 && styles.addButtonTextActive,
              ]}
            >
              {quantityInCart > 0 ? `${quantityInCart}` : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#1A1814',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: Colors.surfaceSubtle,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBody: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  description: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3EFE6',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  addButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  addButtonTextActive: {
    color: Colors.white,
  },
  dietaryIndicator: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  dietaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgePopular: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  badgePopularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },

  // Row Layout
  rowCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#1A1814',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  rowImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
  },
  rowContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rowDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
