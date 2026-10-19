import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenCart?: () => void;
  onOpenRoleSwitcher?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  onOpenCart,
  onOpenRoleSwitcher,
}) => {
  const { totalItems } = useCart();
  const { currentRole, deliveryPerson } = useAuth();
  const { settings } = useMenu();

  const isStoreOpen = settings?.general?.isOpen !== false;

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.brandingContainer}
            onPress={onOpenRoleSwitcher}
            activeOpacity={0.8}
          >
            <View style={styles.logoBadge}>
              <Text style={styles.logoLetter}>G</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>
                {title || 'Grand View'}
              </Text>
              <Text style={styles.brandTagline}>
                {subtitle || (currentRole === 'delivery' ? 'Delivery Partner Portal' : 'Good Food. Great Moments.')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.rightContainer}>
        {/* Restaurant Open/Closed Status for customer */}
        {currentRole === 'customer' && !showBack && (
          <View
            style={[
              styles.statusChip,
              { backgroundColor: isStoreOpen ? '#ECFDF5' : '#FEF2F2' },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isStoreOpen ? Colors.success : Colors.danger },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isStoreOpen ? Colors.success : Colors.danger },
              ]}
            >
              {isStoreOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        )}

        {/* Cart Icon (Customer mode) */}
        {currentRole === 'customer' && onOpenCart && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenCart}
            activeOpacity={0.7}
          >
            <Ionicons name="bag-handle-outline" size={22} color={Colors.textPrimary} />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {totalItems > 99 ? '99+' : totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Role Switcher Button */}
        {onOpenRoleSwitcher && (
          <TouchableOpacity
            style={[
              styles.iconButton,
              currentRole === 'delivery' && styles.deliveryButtonActive,
            ]}
            onPress={onOpenRoleSwitcher}
            activeOpacity={0.7}
          >
            <Ionicons
              name={currentRole === 'delivery' ? 'bicycle' : 'swap-horizontal'}
              size={20}
              color={currentRole === 'delivery' ? Colors.white : Colors.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    shadowColor: '#1A1814',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  logoLetter: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  brandTagline: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  deliveryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
});
