import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

interface RoleSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenDeliveryLogin: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  visible,
  onClose,
  onOpenDeliveryLogin,
}) => {
  const { currentRole, deliveryPerson, switchToCustomer, logoutDelivery } = useAuth();

  const handleSelectCustomer = () => {
    switchToCustomer();
    onClose();
  };

  const handleSelectDelivery = () => {
    if (deliveryPerson) {
      // Already authenticated as delivery partner
      onClose();
    } else {
      onClose();
      onOpenDeliveryLogin();
    }
  };

  const handleLogoutDelivery = async () => {
    await logoutDelivery();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.title}>Switch Experience</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Grand View Restaurant mobile application serves both diners and our delivery partners.
              </Text>

              {/* Option 1: Customer Dining */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  currentRole === 'customer' && styles.optionCardActive,
                ]}
                onPress={handleSelectCustomer}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="restaurant" size={22} color={Colors.primaryDark} />
                </View>
                <View style={styles.optionDetails}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionTitle}>Customer Dining</Text>
                    {currentRole === 'customer' && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionDescription}>
                    Browse dynamic menu, place orders, save Lakshadweep delivery addresses.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: Delivery Partner */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  currentRole === 'delivery' && styles.optionCardActive,
                ]}
                onPress={handleSelectDelivery}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="bicycle" size={22} color={Colors.primaryDark} />
                </View>
                <View style={styles.optionDetails}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionTitle}>Delivery Partner</Text>
                    {currentRole === 'delivery' && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionDescription}>
                    {deliveryPerson
                      ? `Logged in as ${deliveryPerson.name} (${deliveryPerson.phone})`
                      : 'Assigned orders, customer house details, and one-tap delivery updates.'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Delivery Logout if logged in */}
              {currentRole === 'delivery' && deliveryPerson && (
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogoutDelivery}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
                  <Text style={styles.logoutButtonText}>Sign Out from Delivery</Text>
                </TouchableOpacity>
              )}

              {/* Web Admin note */}
              <View style={styles.adminNote}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.adminNoteText}>
                  Restaurant Admin panel remains securely managed on the web dashboard.
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 20, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activePill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activePillText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  logoutButtonText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  adminNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceSubtle,
    padding: 10,
    borderRadius: 8,
  },
  adminNoteText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 15,
  },
});
