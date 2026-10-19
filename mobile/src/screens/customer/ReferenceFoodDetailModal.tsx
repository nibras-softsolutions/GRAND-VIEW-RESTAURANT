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
import { useCart } from '../../context/CartContext';
import { FoodItem, FoodAddOn } from '../../types';

interface ReferenceFoodDetailModalProps {
  item: any | null;
  visible: boolean;
  onClose: () => void;
}

export const ReferenceFoodDetailModal: React.FC<ReferenceFoodDetailModalProps> = ({
  item,
  visible,
  onClose,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<FoodAddOn[]>([]);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  // Custom add-on options based on item category
  const availableAddOns: FoodAddOn[] =
    item.category === 'Burger'
      ? [
          { id: 'add-cheese', name: 'Extra Cheddar Cheese', price: 0.8 },
          { id: 'add-patty', name: 'Extra Grilled Patty', price: 2.5 },
          { id: 'add-bacon', name: 'Crispy Beef Bacon', price: 1.2 },
        ]
      : item.category === 'Pizza'
      ? [
          { id: 'add-stuffed', name: 'Cheese Stuffed Crust', price: 1.5 },
          { id: 'add-jalapeno', name: 'Extra Jalapeños', price: 0.6 },
          { id: 'add-garlic-dip', name: 'Creamy Garlic Dip', price: 0.75 },
        ]
      : [
          { id: 'add-sauce', name: 'Special Island Garlic Dip', price: 0.5 },
          { id: 'add-spicy', name: 'Extra Chili Flakes', price: 0.3 },
        ];

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const finalPrice = ((item.price || 0) + addOnsTotal) * quantity;

  const toggleAddOn = (addOn: FoodAddOn) => {
    if (selectedAddOns.some((a) => a.id === addOn.id)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addOn.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleAddToCart = () => {
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
      addOns: availableAddOns,
    };

    addToCart(foodItem, quantity, selectedAddOns, notes);
    setQuantity(1);
    setSelectedAddOns([]);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Centered Food Graphic */}
          <View style={styles.graphicContainer}>
            <View style={styles.graphicCircle} />
            <Image
              source={item.asset}
              style={styles.foodImage}
              resizeMode="contain"
            />
          </View>

          {/* Details */}
          <View style={styles.body}>
            <View style={styles.titlePriceRow}>
              <View style={styles.titleCol}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.category}>{item.category || 'Special'}</Text>
              </View>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>

            {/* Badges */}
            <View style={styles.badgesRow}>
              {item.calories ? (
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeEmoji}>🔥</Text>
                  <Text style={styles.badgeText}>{item.calories} Calories</Text>
                </View>
              ) : null}

              {item.prepTime ? (
                <View style={styles.badgeItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.primary} />
                  <Text style={styles.badgeText}>{item.prepTime} delivery</Text>
                </View>
              ) : null}

              <View style={styles.badgeItem}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.badgeText}>4.9 (120+)</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              {item.description ||
                'Prepared fresh with island aromatic spices, high-grade ingredients, and authentic culinary cooking traditions.'}
            </Text>

            {/* Add-ons */}
            {availableAddOns.length > 0 && (
              <View style={styles.addOnsSection}>
                <Text style={styles.sectionHeading}>Choice of Add-ons</Text>
                <Text style={styles.sectionSubtitle}>Customize your meal</Text>

                {availableAddOns.map((addOn) => {
                  const isChecked = selectedAddOns.some((a) => a.id === addOn.id);
                  return (
                    <TouchableOpacity
                      key={addOn.id}
                      style={[
                        styles.addOnRow,
                        isChecked && styles.addOnRowChecked,
                      ]}
                      onPress={() => toggleAddOn(addOn)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.addOnLeft}>
                        <View
                          style={[
                            styles.checkbox,
                            isChecked && styles.checkboxChecked,
                          ]}
                        >
                          {isChecked && (
                            <Ionicons name="checkmark" size={13} color={Colors.white} />
                          )}
                        </View>
                        <Text style={styles.addOnName}>{addOn.name}</Text>
                      </View>
                      <Text style={styles.addOnPrice}>+${addOn.price.toFixed(2)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Special Instructions */}
            <View style={styles.notesSection}>
              <Text style={styles.sectionHeading}>Cooking Notes / Instructions</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="E.g. Extra spicy, no onions, sauce on the side..."
                placeholderTextColor={Colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <View style={styles.stepper}>
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

          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Text style={styles.addToCartText}>
              Add to Cart • ${finalPrice.toFixed(2)}
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
    right: 18,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphicContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFBFB',
    position: 'relative',
  },
  graphicCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#EDF8E5',
  },
  foodImage: {
    width: 150,
    height: 150,
  },
  body: {
    padding: 20,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleCol: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  addOnsSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  addOnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  addOnRowChecked: {
    borderColor: Colors.primaryLight,
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
    borderColor: Colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  addOnName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addOnPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  notesSection: {
    marginBottom: 10,
  },
  notesInput: {
    backgroundColor: '#F5F6F8',
    borderWidth: 1,
    borderColor: '#ECEEF1',
    borderRadius: 12,
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ECEEF1',
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
    borderColor: '#ECEEF1',
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  addToCartText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
