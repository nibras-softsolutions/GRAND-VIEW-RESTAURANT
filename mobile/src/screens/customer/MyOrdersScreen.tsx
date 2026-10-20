import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Order, OrderStatus } from '../../types';
import { getMergedOrders, cancelOrder } from '../../api/orders';
import { useCart } from '../../context/CartContext';

interface MyOrdersScreenProps {
  onNavigateToHome: () => void;
  onNavigateToCart: () => void;
  onTrackOrder: (orderId: string) => void;
}

type OrderFilter = 'all' | 'active' | 'delivered' | 'cancelled';

const ACTIVE_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'ready_for_pickup',
  'out_for_delivery',
];

const CANCELLABLE_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
];

export const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({
  onNavigateToHome,
  onNavigateToCart,
  onTrackOrder,
}) => {
  const { addToCart } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getMergedOrders();
      setOrders(data);
    } catch (e) {
      console.warn('Error fetching orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  // Order Counts for tracking number of orders
  const totalCount = orders.length;
  const activeCount = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled' || o.status === 'rejected').length;

  // Filtered list
  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'active') return ACTIVE_STATUSES.includes(o.status);
    if (activeFilter === 'delivered') return o.status === 'delivered';
    if (activeFilter === 'cancelled') return o.status === 'cancelled' || o.status === 'rejected';
    return true;
  });

  // Cancel Order Handler
  const handleCancelOrder = (order: Order) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order ${order.id}? This will notify the kitchen immediately.`,
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(order.id);
            try {
              const res = await cancelOrder(order.id, 'Cancelled by customer via app');
              if (res.success) {
                // Update local state immediately
                setOrders((prev) =>
                  prev.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' } : o))
                );
                Alert.alert('Order Cancelled', `Order ${order.id} has been cancelled successfully.`);
              } else {
                Alert.alert('Notice', 'Unable to cancel order right now. Please call the restaurant.');
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to connect. Please try again.');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  // Reorder Handler
  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      onNavigateToHome();
      return;
    }

    // Add each item from the past order to the current cart
    order.items.forEach((item) => {
      if (item.foodItem) {
        addToCart(
          item.foodItem,
          item.quantity || 1,
          item.selectedAddOns || [],
          item.specialInstructions || ''
        );
      }
    });

    Alert.alert(
      'Items Added to Cart',
      `${order.items.length} item(s) from order ${order.id} have been added to your cart.`,
      [
        { text: 'Stay on Orders', style: 'cancel' },
        { text: 'Go to Cart', onPress: onNavigateToCart },
      ]
    );
  };

  // Status Badge Helper
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={13} color="#D97706" />
            <Text style={[styles.badgeText, { color: '#B45309' }]}>Order Placed</Text>
          </View>
        );
      case 'confirmed':
        return (
          <View style={[styles.badge, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="checkmark-circle-outline" size={13} color="#059669" />
            <Text style={[styles.badgeText, { color: '#047857' }]}>Confirmed</Text>
          </View>
        );
      case 'preparing':
        return (
          <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="flame-outline" size={13} color="#D97706" />
            <Text style={[styles.badgeText, { color: '#B45309' }]}>Cooking in Kitchen</Text>
          </View>
        );
      case 'ready':
      case 'ready_for_pickup':
        return (
          <View style={[styles.badge, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="bag-check-outline" size={13} color="#4F46E5" />
            <Text style={[styles.badgeText, { color: '#4338CA' }]}>Ready for Dispatch</Text>
          </View>
        );
      case 'out_for_delivery':
        return (
          <View style={[styles.badge, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="bicycle-outline" size={13} color="#EA580C" />
            <Text style={[styles.badgeText, { color: '#C2410C' }]}>Out for Delivery</Text>
          </View>
        );
      case 'delivered':
        return (
          <View style={[styles.badge, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="checkmark-done-circle" size={13} color="#10B981" />
            <Text style={[styles.badgeText, { color: '#065F46' }]}>Delivered</Text>
          </View>
        );
      case 'cancelled':
      case 'rejected':
      default:
        return (
          <View style={[styles.badge, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="close-circle-outline" size={13} color="#DC2626" />
            <Text style={[styles.badgeText, { color: '#B91C1C' }]}>Cancelled</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>
            Track active deliveries & cancel orders
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

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
        {/* =========================================
            Order Tracking & Summary Stats Cards
           ========================================= */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, activeFilter === 'all' && styles.statCardSelected]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBadge, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="receipt-outline" size={16} color={Colors.textPrimary} />
            </View>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, activeFilter === 'active' && styles.statCardSelected]}
            onPress={() => setActiveFilter('active')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="bicycle" size={16} color="#D97706" />
            </View>
            <Text style={[styles.statNumber, { color: '#D97706' }]}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, activeFilter === 'delivered' && styles.statCardSelected]}
            onPress={() => setActiveFilter('delivered')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBadge, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-done" size={16} color="#059669" />
            </View>
            <Text style={[styles.statNumber, { color: '#059669' }]}>{deliveredCount}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, activeFilter === 'cancelled' && styles.statCardSelected]}
            onPress={() => setActiveFilter('cancelled')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBadge, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="close" size={16} color="#DC2626" />
            </View>
            <Text style={[styles.statNumber, { color: '#DC2626' }]}>{cancelledCount}</Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
              All ({totalCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'active' && styles.filterChipActive]}
            onPress={() => setActiveFilter('active')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'active' && styles.filterChipTextActive]}>
              Active ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'delivered' && styles.filterChipActive]}
            onPress={() => setActiveFilter('delivered')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'delivered' && styles.filterChipTextActive]}>
              Delivered ({deliveredCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'cancelled' && styles.filterChipActive]}
            onPress={() => setActiveFilter('cancelled')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'cancelled' && styles.filterChipTextActive]}>
              Cancelled ({cancelledCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading your orders...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={44} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all'
                ? 'No orders placed yet'
                : `No ${activeFilter} orders found`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'Taste our royal biryanis, gravies, and beverages cooked fresh daily at Grand View.'
                : `You currently do not have any orders under the "${activeFilter}" category.`}
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={onNavigateToHome}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>Explore Restaurant Menu</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Order Cards List */}
        {!loading &&
          filteredOrders.map((order) => {
            const isActive = ACTIVE_STATUSES.includes(order.status);
            const isCancellable = CANCELLABLE_STATUSES.includes(order.status);
            const isCancelling = cancellingId === order.id;

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Top Row: Order ID + Status Badge */}
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderIdGroup}>
                    <Ionicons name="receipt" size={16} color={Colors.primary} />
                    <Text style={styles.orderIdText}>{order.id}</Text>
                  </View>
                  {renderStatusBadge(order.status)}
                </View>

                {/* Date & Destination */}
                <View style={styles.orderMetaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{order.createdAt || 'Recent order'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {order.island || 'Lakshadweep'} • {order.houseName || 'Local Delivery'}
                    </Text>
                  </View>
                </View>

                {/* Items Summary */}
                <View style={styles.orderItemsBox}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((it, idx) => (
                      <View key={idx} style={styles.orderItemLine}>
                        <Text style={styles.itemQty}>{it.quantity || 1}x</Text>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {it.foodItem?.name || 'Grand View Dish'}
                        </Text>
                        <Text style={styles.itemPrice}>
                          ₹{(it.itemTotal || it.foodItem?.price || 0).toFixed(2)}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.itemFallback}>Grand View Signature Meal</Text>
                  )}
                </View>

                {/* Total Row */}
                <View style={styles.orderTotalRow}>
                  <Text style={styles.totalLabel}>Total Paid / Due</Text>
                  <Text style={styles.totalAmount}>
                    ₹{Number(order.total || 0).toFixed(2)}
                  </Text>
                </View>

                {/* Actions Footer */}
                <View style={styles.cardActions}>
                  {/* Track Order CTA for Active Orders */}
                  {isActive && (
                    <TouchableOpacity
                      style={styles.trackBtn}
                      onPress={() => onTrackOrder(order.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="compass" size={16} color={Colors.white} />
                      <Text style={styles.trackBtnText}>Track Order</Text>
                    </TouchableOpacity>
                  )}

                  {/* Cancel Order CTA for Cancellable Orders */}
                  {isCancellable && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancelOrder(order)}
                      disabled={isCancelling}
                      activeOpacity={0.8}
                    >
                      {isCancelling ? (
                        <ActivityIndicator size="small" color={Colors.danger} />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={16} color={Colors.danger} />
                          <Text style={styles.cancelBtnText}>Cancel Order</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Reorder CTA for Completed or Cancelled Orders */}
                  {!isActive && (
                    <TouchableOpacity
                      style={styles.reorderBtn}
                      onPress={() => handleReorder(order)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="repeat" size={16} color={Colors.primary} />
                      <Text style={styles.reorderBtnText}>Reorder Dishes</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  /* Stats overview cards */
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFBEB',
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },

  /* Filter Chips */
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },

  /* Loading */
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },

  /* Empty state */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
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
    maxWidth: 280,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  exploreBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  /* Order Card */
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderIdGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textMuted,
  },

  orderItemsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  orderItemLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    width: 24,
  },
  itemName: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemFallback: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
  },
  reorderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
