import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus | string;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const normalized = (status || '').toLowerCase();

  let label = 'Pending';
  let bgColor = Colors.warningBg;
  let textColor = Colors.warning;
  let borderColor = '#FDE68A';

  switch (normalized) {
    case 'confirmed':
      label = 'Confirmed';
      bgColor = '#EFF6FF';
      textColor = '#2563EB';
      borderColor = '#BFDBFE';
      break;
    case 'preparing':
      label = 'Preparing';
      bgColor = '#FFFBEB';
      textColor = '#D97706';
      borderColor = '#FDE68A';
      break;
    case 'ready':
    case 'ready_for_pickup':
      label = 'Ready';
      bgColor = '#F5F3FF';
      textColor = '#7C3AED';
      borderColor = '#DDD6FE';
      break;
    case 'out_for_delivery':
      label = 'Out for Delivery';
      bgColor = '#ECFDF5';
      textColor = '#059669';
      borderColor = '#A7F3D0';
      break;
    case 'delivered':
      label = 'Delivered';
      bgColor = Colors.successBg;
      textColor = Colors.success;
      borderColor = '#BBF7D0';
      break;
    case 'rejected':
    case 'cancelled':
      label = 'Rejected';
      bgColor = Colors.dangerBg;
      textColor = Colors.danger;
      borderColor = '#FECACA';
      break;
    default:
      label = 'Pending';
      bgColor = '#F3F4F6';
      textColor = '#6B7280';
      borderColor = '#E5E7EB';
  }

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          paddingHorizontal: isSmall ? 8 : isLarge ? 14 : 10,
          paddingVertical: isSmall ? 3 : isLarge ? 6 : 4,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: textColor }]} />
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: isSmall ? 11 : isLarge ? 14 : 12,
            fontWeight: isLarge ? '700' : '600',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    textTransform: 'capitalize',
  },
});
