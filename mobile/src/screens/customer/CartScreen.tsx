import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

interface CartScreenProps {
  onNavigateToHome: () => void;
  onProceedToCheckout: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onNavigateToHome,
  onProceedToCheckout,
}) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    tax,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
    discountAmount,
    deliveryAddress,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApply = () => {
    if (!inputCoupon.trim()) return;
    const ok = applyCoupon(inputCoupon.trim().toUpperCase());
    if (ok) {
      setCouponError(null);
      setInputCoupon('');
    } else {
      setCouponError('Invalid coupon. Try FOODIE30, FREESHIP or GRAND30');
    }
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="bag-handle-outline" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Explore delicious dishes, biryanis, and refreshing drinks from Alfiya Kitchen.
        </Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={onNavigateToHome}
          activeOpacity={0.85}
        >
          <Text style={styles.browseBtnText}>Explore Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity
              onPress={onNavigateToHome}
              style={styles.backBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Cart</Text>
          </View>
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Destination Card */}
        <View style={styles.addressCard}>
          <View style={styles.addressLeft}>
            <View style={styles.locationPin}>
              <Ionicons name="location" size={16} color={Colors.primary} />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>
                {deliveryAddress?.label || 'Home'} • {deliveryAddress?.fullName}
              </Text>
              <Text style={styles.addressText} numberOfLines={1}>
                {deliveryAddress?.houseName}, {deliveryAddress?.locality}, {deliveryAddress?.island}
              </Text>
            </View>
          </View>
        </View>

        {/* Cart Items List */}
        <View style={styles.itemsList}>
          {cart.map((item) => (
            <View key={item.cartItemId} style={styles.itemCard}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.foodItem.name}</Text>
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <Text style={styles.itemAddOns}>
                    + {item.selectedAddOns.map((a) => a.name).join(', ')}
                  </Text>
                )}
                {item.specialInstructions ? (
                  <Text style={styles.itemInstructions} numberOfLines={1}>
                    Note: {item.specialInstructions}
                  </Text>
                ) : null}
                <Text style={styles.itemPrice}>
                  ₹{item.itemTotal.toFixed(2)}
                </Text>
              </View>

              {/* Quantity Stepper */}
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                >
                  <Ionicons
                    name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                    size={15}
                    color={item.quantity === 1 ? Colors.danger : Colors.textPrimary}
                  />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                >
                  <Ionicons name="add" size={15} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Promo Code Input */}
        <View style={styles.couponCard}>
          <Text style={styles.couponTitle}>Have a Promo Code?</Text>
          <View style={styles.couponInputRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="e.g. GRAND30 or FREESHIP"
              placeholderTextColor={Colors.textMuted}
              value={inputCoupon}
              onChangeText={setInputCoupon}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {couponCode && (
            <View style={styles.activeCouponRow}>
              <Text style={styles.activeCouponText}>
                Coupon {couponCode} applied (-₹{discountAmount.toFixed(2)})
              </Text>
              <TouchableOpacity onPress={removeCoupon}>
                <Ionicons name="close-circle" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          )}

          {couponError && (
            <Text style={styles.couponErrorText}>{couponError}</Text>
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Bill Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Standard Delivery</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>
                Discount ({couponCode})
              </Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                -₹{discountAmount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes & Fees</Text>
            <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Checkout Button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalValue}>₹{total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={onProceedToCheckout}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  clearText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '600',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  locationPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemsList: {
    gap: 12,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemAddOns: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemInstructions: {
    fontSize: 11,
    color: Colors.primary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 10,
  },
  couponCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  activeCouponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  activeCouponText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  couponErrorText: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECEEF1',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 24,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  checkoutBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FAFBFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
