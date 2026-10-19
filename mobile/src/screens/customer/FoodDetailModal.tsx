import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { FoodItem, FoodAddOn } from '../../types';
import { useCart } from '../../context/CartContext';

interface FoodDetailModalProps {
  item: FoodItem | null;
  visible: boolean;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  visible,
  onClose,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<FoodAddOn[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!item) return null;

  const hasDiscount = !!item.discountPrice && item.discountPrice < item.price;
  const basePrice = hasDiscount ? item.discountPrice! : item.price;

  const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const totalPrice = (basePrice + addOnsTotal) * quantity;

  const handleToggleAddOn = (addOn: FoodAddOn) => {
    if (selectedAddOns.some((a) => a.id === addOn.id)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addOn.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleAddToCart = () => {
    addToCart(item, quantity, selectedAddOns, specialInstructions);
    // Reset state and close
    setQuantity(1);
    setSelectedAddOns([]);
    setSpecialInstructions('');
    onClose();
  };

  const imageUri =
    item.image && item.image.startsWith('http')
      ? item.image
      : item.image && item.image.startsWith('/')
      ? `https://grand-view-restaurant.vercel.app${item.image}`
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Top Floating Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Dish Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.foodImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlayShadow} />
          </View>

          {/* Body Content */}
          <View style={styles.body}>
            {/* Header / Badges */}
            <View style={styles.badgesRow}>
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

              <Text style={styles.categoryBadge}>{item.category}</Text>

              {item.popular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="flame" size={12} color="#B45309" />
                  <Text style={styles.popularBadgeText}>Popular</Text>
                </View>
              )}
            </View>

            {/* Dish Title */}
            <Text style={styles.title}>{item.name}</Text>

            {/* Price display */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{basePrice}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>₹{item.price}</Text>
              )}
            </View>

            {/* Description */}
            <Text style={styles.description}>
              {item.description ||
                'Prepared fresh with island aromatic spices, high-grade olive oils, and authentic Lakshadweep coastal cooking traditions.'}
            </Text>

            {/* Key specs (Prep time, portion size, calories) */}
            <View style={styles.specsRow}>
              {item.prepTime ? (
                <View style={styles.specItem}>
                  <Ionicons name="timer-outline" size={16} color={Colors.primaryDark} />
                  <Text style={styles.specText}>{item.prepTime}</Text>
                </View>
              ) : (
                <View style={styles.specItem}>
                  <Ionicons name="timer-outline" size={16} color={Colors.primaryDark} />
                  <Text style={styles.specText}>15-20 mins prep</Text>
                </View>
              )}

              {item.portionSize && (
                <View style={styles.specItem}>
                  <Ionicons name="restaurant-outline" size={16} color={Colors.primaryDark} />
                  <Text style={styles.specText}>{item.portionSize}</Text>
                </View>
              )}

              {item.calories && (
                <View style={styles.specItem}>
                  <Ionicons name="speedometer-outline" size={16} color={Colors.primaryDark} />
                  <Text style={styles.specText}>{item.calories} kcal</Text>
                </View>
              )}
            </View>

            {/* Add-ons list if any */}
            {item.addOns && item.addOns.length > 0 && (
              <View style={styles.addOnSection}>
                <Text style={styles.sectionHeading}>Choice of Add-ons</Text>
                <Text style={styles.sectionSub}>Select any extra accompaniments</Text>

                {item.addOns.map((addOn) => {
                  const isChecked = selectedAddOns.some((a) => a.id === addOn.id);
                  return (
                    <TouchableOpacity
                      key={addOn.id}
                      style={[styles.addOnRow, isChecked && styles.addOnRowActive]}
                      onPress={() => handleToggleAddOn(addOn)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.addOnLeft}>
                        <View
                          style={[
                            styles.checkbox,
                            isChecked && styles.checkboxActive,
                          ]}
                        >
                          {isChecked && (
                            <Ionicons name="checkmark" size={14} color={Colors.white} />
                          )}
                        </View>
                        <Text style={styles.addOnName}>{addOn.name}</Text>
                      </View>
                      <Text style={styles.addOnPrice}>+₹{addOn.price}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Special Instructions Input */}
            <View style={styles.instructionsSection}>
              <Text style={styles.sectionHeading}>Cooking Notes / Instructions</Text>
              <TextInput
                style={styles.instructionInput}
                placeholder="E.g. Extra spicy, less oil, no coriander..."
                placeholderTextColor={Colors.textLight}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA Bar */}
        <View style={styles.footer}>
          {/* Quantity Stepper */}
          <View style={styles.quantityStepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{quantity}</Text>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Add to Cart CTA */}
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Text style={styles.addToCartBtnText}>
              Add to Order • ₹{totalPrice}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 20,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 260,
    width: '100%',
    backgroundColor: Colors.surfaceSubtle,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  body: {
    padding: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dietaryIndicator: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  dietaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  originalPrice: {
    fontSize: 15,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  specsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 20,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  addOnSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  addOnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
    backgroundColor: Colors.surface,
  },
  addOnRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  addOnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  addOnName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addOnPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  instructionsSection: {
    marginBottom: 10,
  },
  instructionInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: Colors.textPrimary,
    minHeight: 60,
    marginTop: 6,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quantityText: {
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addToCartBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
