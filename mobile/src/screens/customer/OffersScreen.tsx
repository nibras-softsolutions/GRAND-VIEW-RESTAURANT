import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

interface OffersScreenProps {
  onNavigateToCart: () => void;
}

export const OffersScreen: React.FC<OffersScreenProps> = ({ onNavigateToCart }) => {
  const { applyCoupon } = useCart();

  const offers = [
    {
      code: 'FOODIE30',
      title: '30% Off Your Entire Order',
      desc: 'Applicable on orders above $15. Maximum discount $6.00.',
      expiry: 'Valid all week',
      color: '#DC2626',
    },
    {
      code: 'FREESHIP',
      title: 'Free Island Delivery',
      desc: 'Zero standard delivery fee across all local island addresses.',
      expiry: 'Valid today',
      color: Colors.primary,
    },
    {
      code: 'alfiyakitchen',
      title: '$5 Off Special Welcome',
      desc: 'Exclusive discount for customers celebrating island culinary heritage.',
      expiry: 'Ongoing',
      color: '#7C3AED',
    },
  ];

  const handleApply = (code: string) => {
    applyCoupon(code);
    Alert.alert('Coupon Applied', `Code ${code} was successfully added to your cart!`, [
      { text: 'View Cart', onPress: onNavigateToCart },
      { text: 'OK' },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deals & Offers</Text>
        <Text style={styles.headerSub}>Exclusive restaurant discount vouchers</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {offers.map((offer) => (
          <View key={offer.code} style={styles.offerCard}>
            <View style={[styles.cardTag, { backgroundColor: offer.color }]}>
              <Ionicons name="pricetag" size={14} color={Colors.white} />
              <Text style={styles.tagText}>{offer.code}</Text>
            </View>

            <Text style={styles.offerTitle}>{offer.title}</Text>
            <Text style={styles.offerDesc}>{offer.desc}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.expiryText}>{offer.expiry}</Text>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => handleApply(offer.code)}
                activeOpacity={0.8}
              >
                <Text style={styles.applyBtnText}>Apply Coupon</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  headerSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 90,
  },
  offerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  tagText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  offerDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  expiryText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  applyBtn: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  applyBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
