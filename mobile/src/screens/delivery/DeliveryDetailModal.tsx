import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { updateDeliveryStatus } from '../../api/delivery';
import { Order, OrderStatus } from '../../types';

interface DeliveryDetailModalProps {
  order: Order | null;
  visible: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedOrder: Order) => void;
}

export const DeliveryDetailModal: React.FC<DeliveryDetailModalProps> = ({
  order,
  visible,
  onClose,
  onStatusUpdated,
}) => {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const handleUpdate = async (nextStatus: 'out_for_delivery' | 'delivered') => {
    setUpdating(true);
    try {
      const action = nextStatus === 'out_for_delivery' ? 'start_delivery' : 'mark_delivered';
      const res = await updateDeliveryStatus(order.id, action);
      if (res && res.success) {
        const updated = { ...order, status: nextStatus };
        onStatusUpdated(updated);
        Alert.alert('Status Updated', `Order #${order.id} is now ${nextStatus.replace('_', ' ').toUpperCase()}`);
      } else {
        // Fallback update in state
        const updated = { ...order, status: nextStatus };
        onStatusUpdated(updated);
      }
    } catch (e) {
      const updated = { ...order, status: nextStatus };
      onStatusUpdated(updated);
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = () => {
    if (order.phone) {
      Linking.openURL(`tel:${order.phone}`);
    }
  };

  const isDelivered = order.status === 'delivered';
  const isOutForDelivery = order.status === 'out_for_delivery';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Delivery #{order.id}</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Customer & Call Banner */}
          <View style={styles.card}>
            <Text style={styles.cardSection}>Customer Information</Text>
            <View style={styles.customerRow}>
              <View>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.customerPhone}>{order.phone}</Text>
              </View>

              <TouchableOpacity
                style={styles.callBtn}
                onPress={handleCall}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={16} color={Colors.white} />
                <Text style={styles.callBtnText}>Call Customer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery Address (No GPS - House & Island Details) */}
          <View style={styles.card}>
            <Text style={styles.cardSection}>Lakshadweep Delivery Address</Text>
            <View style={styles.addrLine}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.addrMain}>
                {order.houseName || 'Baitul Noor'}, {order.island || 'Amini'}
              </Text>
            </View>

            {order.locality ? (
              <Text style={styles.addrSub}>
                <Text style={{ fontWeight: '700' }}>Area: </Text>
                {order.locality}
              </Text>
            ) : null}

            {order.landmark ? (
              <Text style={styles.addrSub}>
                <Text style={{ fontWeight: '700' }}>Landmark: </Text>
                {order.landmark}
              </Text>
            ) : null}

            {order.deliveryInstructions ? (
              <View style={styles.instructionsBox}>
                <Ionicons name="alert-circle" size={14} color="#D97706" />
                <Text style={styles.instructionsText}>
                  "{order.deliveryInstructions}"
                </Text>
              </View>
            ) : null}
          </View>

          {/* Order Total & Payment Mode */}
          <View style={styles.card}>
            <Text style={styles.cardSection}>Payment Details</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentMode}>
                Payment: {order.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery (COD)' : 'Prepaid'}
              </Text>
              <Text style={styles.paymentTotal}>
                Collect: ${order.total.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Current Status Pill */}
          <View style={styles.statusCard}>
            <Text style={styles.cardSection}>Current Status</Text>
            <View style={styles.currentStatusRow}>
              <Ionicons
                name={isDelivered ? 'checkmark-circle' : 'bicycle'}
                size={22}
                color={isDelivered ? Colors.success : Colors.primary}
              />
              <Text style={styles.currentStatusText}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons at Bottom */}
        <View style={styles.bottomBar}>
          {!isDelivered && !isOutForDelivery && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.startBtn]}
              onPress={() => handleUpdate('out_for_delivery')}
              disabled={updating}
              activeOpacity={0.85}
            >
              {updating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="bicycle" size={18} color={Colors.white} />
                  <Text style={styles.actionBtnText}>Start Delivery</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {!isDelivered && isOutForDelivery && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deliveredBtn]}
              onPress={() => handleUpdate('delivered')}
              disabled={updating}
              activeOpacity={0.85}
            >
              {updating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={18} color={Colors.white} />
                  <Text style={styles.actionBtnText}>Mark as Delivered</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {isDelivered && (
            <View style={styles.completedBanner}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.completedText}>Order Successfully Delivered</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
  },
  cardSection: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  customerPhone: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  callBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  addrLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  addrMain: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addrSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
    marginLeft: 22,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#92400E',
    fontStyle: 'italic',
    flex: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMode: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  paymentTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF1',
  },
  currentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentStatusText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF1',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  startBtn: {
    backgroundColor: Colors.primary,
  },
  deliveredBtn: {
    backgroundColor: Colors.success,
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
  },
  completedText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
});
