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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { fetchOrderById, cancelOrder } from '../../api/orders';
import { Order, OrderStatus } from '../../types';

interface OrderTrackingScreenProps {
  orderId: string;
  onBackToHome: () => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  {
    status: 'pending',
    label: 'Order Placed',
    desc: 'Your order was received by Alfiya Kitchen kitchen.',
  },
  {
    status: 'confirmed',
    label: 'Confirmed',
    desc: 'Restaurant accepted your order.',
  },
  {
    status: 'preparing',
    label: 'Preparing',
    desc: 'Our island chefs are cooking your meal fresh.',
  },
  {
    status: 'ready',
    label: 'Ready for Dispatch',
    desc: 'Food is packed hot and assigned for delivery.',
  },
  {
    status: 'out_for_delivery',
    label: 'Out for Delivery',
    desc: 'Delivery partner is en route to your house.',
  },
  {
    status: 'delivered',
    label: 'Delivered',
    desc: 'Enjoy your hot meal! Great Food, Great Moments.',
  },
];

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  orderId,
  onBackToHome,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('confirmed');

  const [cancelling, setCancelling] = useState(false);

  const loadOrder = async () => {
    try {
      const data = await fetchOrderById(orderId);
      if (data && data.order) {
        setOrder(data.order);
        setCurrentStatus(data.order.status || 'confirmed');
      }
    } catch (e) {
      // Keep existing status
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order #${orderId}? The restaurant kitchen will be notified immediately.`,
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelOrder(orderId, 'Cancelled by customer from tracking screen');
              setCurrentStatus('cancelled');
              Alert.alert('Order Cancelled', `Order #${orderId} has been successfully cancelled.`);
            } catch (err) {
              Alert.alert('Error', 'Unable to cancel order right now. Please call restaurant hotline.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrder();
    setRefreshing(false);
  };

  const getStepState = (stepStatus: OrderStatus) => {
    const orderIndex = STATUS_STEPS.findIndex((s) => s.status === currentStatus);
    const stepIndex = STATUS_STEPS.findIndex((s) => s.status === stepStatus);

    if (currentStatus === 'rejected') {
      return { completed: false, active: false, rejected: true };
    }

    if (stepIndex < orderIndex) {
      return { completed: true, active: false, rejected: false };
    }
    if (stepIndex === orderIndex) {
      return { completed: false, active: true, rejected: false };
    }
    return { completed: false, active: false, rejected: false };
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToHome} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Order Status</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} activeOpacity={0.7}>
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
        {/* Status Hero Banner */}
        {currentStatus === 'cancelled' ? (
          <View style={[styles.heroCard, { backgroundColor: '#FEF2F2' }]}>
            <View style={[styles.heroIconCircle, { backgroundColor: Colors.danger }]}>
              <Ionicons name="close-circle" size={28} color={Colors.white} />
            </View>
            <Text style={[styles.heroTitle, { color: Colors.danger }]}>Order Cancelled</Text>
            <Text style={styles.orderNumberText}>Order #{orderId}</Text>
            <View style={[styles.estTimeBadge, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={14} color={Colors.danger} />
              <Text style={[styles.estTimeText, { color: Colors.danger }]}>
                Cancelled by customer • Kitchen notified
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.heroCard}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="restaurant" size={28} color={Colors.white} />
            </View>
            <Text style={styles.heroTitle}>Alfiya Kitchen</Text>
            <Text style={styles.orderNumberText}>Order #{orderId}</Text>
            <View style={styles.estTimeBadge}>
              <Ionicons name="time" size={14} color={Colors.primaryDark} />
              <Text style={styles.estTimeText}>Est. Arrival: 25 - 35 mins</Text>
            </View>
          </View>
        )}

        {/* Visual Timeline (No live GPS) */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          <Text style={styles.noGpsNotice}>
            Status updates authoritative from restaurant kitchen.
          </Text>

          <View style={styles.timelineList}>
            {STATUS_STEPS.map((step, idx) => {
              const { completed, active } = getStepState(step.status);
              const isLast = idx === STATUS_STEPS.length - 1;

              return (
                <View key={step.status} style={styles.timelineRow}>
                  <View style={styles.timelineTrack}>
                    <View
                      style={[
                        styles.dot,
                        completed && styles.dotCompleted,
                        active && styles.dotActive,
                      ]}
                    >
                      {completed ? (
                        <Ionicons name="checkmark" size={12} color={Colors.white} />
                      ) : active ? (
                        <View style={styles.innerPulse} />
                      ) : null}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.line,
                          completed && styles.lineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineDetails}>
                    <Text
                      style={[
                        styles.stepLabel,
                        (active || completed) && styles.stepLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressName}>
            {order?.customerName || 'Mohammed'} • {order?.phone || '+91 94472 00000'}
          </Text>
          <Text style={styles.addressLine}>
            {order?.deliveryAddress || 'Baitul Noor, Near Juma Masjid, Amini (Opposite Post Office)'}
          </Text>
          {order?.deliveryInstructions ? (
            <View style={styles.instructionBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.instructionText}>
                "{order.deliveryInstructions}"
              </Text>
            </View>
          ) : null}
        </View>

        {/* Assigned Delivery Person info if present */}
        {order?.deliveryPersonName && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bicycle" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Delivery Partner Assigned</Text>
            </View>
            <View style={styles.riderRow}>
              <View>
                <Text style={styles.riderName}>{order.deliveryPersonName}</Text>
                <Text style={styles.riderStatus}>On duty with Alfiya Kitchen</Text>
              </View>
              {order.deliveryPersonPhone && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${order.deliveryPersonPhone}`)}
                >
                  <Ionicons name="call" size={16} color={Colors.white} />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        {(currentStatus === 'pending' || currentStatus === 'confirmed' || currentStatus === 'preparing') ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelOrderBtn}
              onPress={handleCancelOrder}
              disabled={cancelling}
              activeOpacity={0.8}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color={Colors.danger} />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color={Colors.danger} />
                  <Text style={styles.cancelOrderBtnText}>Cancel Order</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeBtnSmall}
              onPress={onBackToHome}
              activeOpacity={0.85}
            >
              <Text style={styles.homeBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={onBackToHome}
            activeOpacity={0.85}
          >
            <Text style={styles.homeBtnText}>Return to Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  heroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  orderNumberText: {
    fontSize: 13,
    color: '#D2F6B1',
    fontWeight: '600',
    marginTop: 2,
  },
  estTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
  },
  estTimeText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  noGpsNotice: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  timelineList: {},
  timelineRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineTrack: {
    alignItems: 'center',
    width: 28,
    marginRight: 10,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCompleted: {
    backgroundColor: Colors.primary,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.primarySoft,
  },
  innerPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  lineCompleted: {
    backgroundColor: Colors.primary,
  },
  timelineDetails: {
    flex: 1,
    paddingBottom: 14,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  stepLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addressName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F6F8',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  instructionText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
  riderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  riderName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  riderStatus: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelOrderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 13,
    borderRadius: 24,
  },
  cancelOrderBtnText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  homeBtnSmall: {
    flex: 1.2,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
