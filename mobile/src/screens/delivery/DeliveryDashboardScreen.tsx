import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { fetchAssignedDeliveries } from '../../api/delivery';
import { Order } from '../../types';

interface DeliveryDashboardScreenProps {
  onSelectOrder: (order: Order) => void;
  onOpenProfile: () => void;
}

export const DeliveryDashboardScreen: React.FC<DeliveryDashboardScreenProps> = ({
  onSelectOrder,
  onOpenProfile,
}) => {
  const { deliveryPerson } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const data = await fetchAssignedDeliveries();
      setOrders(data?.orders || []);
    } catch (e) {
      // Mock assigned orders if offline or server response format differs
      setOrders([
        {
          id: 'GV-1024',
          createdAt: new Date().toISOString(),
          items: [],
          subtotal: 18.9,
          deliveryCharge: 0,
          tax: 1.0,
          total: 19.9,
          orderType: 'delivery',
          deliveryAddress: 'Baitul Noor, Near Juma Masjid, Amini',
          island: 'Amini',
          houseName: 'Baitul Noor',
          locality: 'Near Juma Masjid',
          landmark: 'Opposite Post Office',
          deliveryInstructions: 'Please call when arriving at the gate',
          customerName: 'Mohammed Nibras',
          phone: '+91 94472 00000',
          paymentMethod: 'cash-on-delivery',
          status: 'out_for_delivery',
          timeline: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDeliveries();
    setRefreshing(false);
  };

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'rejected');
  const completedOrders = orders.filter((o) => o.status === 'delivered');
  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="bicycle" size={22} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.driverName}>
              {deliveryPerson?.name || 'Sayed Koya'}
            </Text>
            <Text style={styles.driverPhone}>
              Alfiya Kitchen Delivery Partner • {deliveryPerson?.phone || '+91 94472 00001'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.profileBtn} onPress={onOpenProfile} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active Deliveries ({activeOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({completedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching assigned deliveries...</Text>
          </View>
        ) : displayOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={54} color={Colors.primary} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'No Active Deliveries' : 'No Completed Deliveries'}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'active'
                ? 'All assigned orders have been safely delivered. Check back when the restaurant kitchen dispatches new meals.'
                : 'Completed orders for today will appear here.'}
            </Text>
          </View>
        ) : (
          displayOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => onSelectOrder(order)}
              activeOpacity={0.9}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderIdText}>Order #{order.id}</Text>
                  <Text style={styles.customerName}>{order.customerName}</Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        order.status === 'delivered'
                          ? '#DCFCE7'
                          : order.status === 'out_for_delivery'
                          ? '#FEF3C7'
                          : '#EFF6FF',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color:
                          order.status === 'delivered'
                            ? '#16A34A'
                            : order.status === 'out_for_delivery'
                            ? '#D97706'
                            : '#2563EB',
                      },
                    ]}
                  >
                    {order.status === 'out_for_delivery'
                      ? 'Out for Delivery'
                      : order.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Address details (Lakshadweep house name + island) */}
              <View style={styles.addressSection}>
                <View style={styles.addressRow}>
                  <Ionicons name="home-outline" size={15} color={Colors.primary} />
                  <Text style={styles.addressBold}>
                    {order.houseName || 'Baitul Noor'}, {order.island || 'Amini'}
                  </Text>
                </View>

                {order.locality ? (
                  <Text style={styles.addressDetailText}>
                    Area: {order.locality}
                  </Text>
                ) : null}

                {order.landmark ? (
                  <Text style={styles.addressDetailText}>
                    Landmark: {order.landmark}
                  </Text>
                ) : null}

                {order.deliveryInstructions ? (
                  <View style={styles.instructionsBox}>
                    <Ionicons name="information-circle" size={13} color="#D97706" />
                    <Text style={styles.instructionsText}>
                      "{order.deliveryInstructions}"
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Action Buttons */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.callCustomerBtn}
                  onPress={() => Linking.openURL(`tel:${order.phone}`)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={15} color={Colors.primary} />
                  <Text style={styles.callCustomerText}>Call Customer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewOrderBtn}
                  onPress={() => onSelectOrder(order)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewOrderText}>View & Update</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  topHeader: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  driverPhone: {
    fontSize: 11,
    color: '#D2F6B1',
    fontWeight: '500',
    marginTop: 2,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#ECEEF1',
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  centered: {
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  orderIdText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '800',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  addressSection: {
    marginBottom: 14,
    gap: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressBold: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addressDetailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 21,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  instructionsText: {
    fontSize: 11,
    color: '#92400E',
    fontStyle: 'italic',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  callCustomerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primarySoft,
    paddingVertical: 10,
    borderRadius: 20,
  },
  callCustomerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  viewOrderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewOrderText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});
