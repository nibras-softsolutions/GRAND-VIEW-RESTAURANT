import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { ReferenceAssets } from '../../theme/assets';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface ProfileScreenProps {
  onOpenSavedAddresses: () => void;
  onOpenRoleSwitcher: () => void;
  onNavigateToOrders: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenSavedAddresses,
  onOpenRoleSwitcher,
  onNavigateToOrders,
  onLogout,
}) => {
  const { currentRole } = useAuth();
  const { deliveryAddress } = useCart();

  const handleCallHotline = () => {
    Linking.openURL('tel:+919447200000');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image source={ReferenceAssets.userAvatar} style={styles.avatar} resizeMode="cover" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {deliveryAddress?.fullName || 'Mohammed Nibras'}
            </Text>
            <Text style={styles.userPhone}>
              {deliveryAddress?.phone || '+91 94472 00000'}
            </Text>
            <View style={styles.badgeRole}>
              <Text style={styles.badgeRoleText}>
                {currentRole === 'delivery' ? 'Delivery Partner' : 'Customer Account'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>

          {/* My Orders Row */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={onNavigateToOrders}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="receipt-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuLabel}>My Orders</Text>
              <Text style={styles.menuSub}>Track active deliveries & cancel orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={onOpenSavedAddresses}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuLabel}>Saved Delivery Addresses</Text>
              <Text style={styles.menuSub}>
                {deliveryAddress?.island || 'Amini'} • {deliveryAddress?.houseName || 'Baitul Noor'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={onOpenRoleSwitcher}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="bicycle-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuLabel}>Switch to Delivery Partner</Text>
              <Text style={styles.menuSub}>Assigned orders and customer delivery route</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleCallHotline}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuLabel}>Restaurant Kitchen Hotline</Text>
              <Text style={styles.menuSub}>+91 94472 00000</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Restaurant Notice */}
        <View style={styles.infoBox}>
          <Ionicons name="restaurant-outline" size={22} color={Colors.primary} />
          <View style={styles.infoCol}>
            <Text style={styles.infoTitle}>Grand View Restaurant</Text>
            <Text style={styles.infoText}>
              Good Food. Great Moments. Operating authentic dining & fast deliveries across Lakshadweep.
            </Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: onLogout },
            ]);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 30,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    marginBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.primarySoft,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userPhone: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badgeRole: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  badgeRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuDetails: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F6F8',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoCol: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: 18,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
