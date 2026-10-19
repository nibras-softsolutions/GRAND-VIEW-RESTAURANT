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
      setCouponError('Invalid coupon. Try FOODIE30 or FREESHIP');
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
          Explore delicious meals, snacks, and refreshing drinks from our menu.
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
          <Text style={styles.headerTitle}>Your Cart</Text>
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
                  ${item.itemTotal.toFixed(2)}
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

        {/* Promo Voucher Section */}
        <View style={styles.couponCard}>
          <View style={styles.couponInputRow}>
            <Ionicons name="pricetag-outline" size={18} color={Colors.primary} />
            <TextInput
              style={styles.couponInput}
              placeholder="Enter promo code (e.g. FOODIE30)"
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
                Coupon {couponCode} applied (-${discountAmount.toFixed(2)})
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
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Standard Delivery</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>
                Discount ({couponCode})
              </Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                -${discountAmount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes & Fees</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Checkout Button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalValue}>${total.toFixed(2)}</Text>
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
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    borderRadius: 14,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
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
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    paddingHorizontal: 6,
    paddingVertical: 4,
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
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  couponCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    marginBottom: 16,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    height: 38,
  },
  applyBtn: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  activeCouponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  activeCouponText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  couponErrorText: {
    color: Colors.danger,
    fontSize: 11,
    marginTop: 6,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: '700',
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
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
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
