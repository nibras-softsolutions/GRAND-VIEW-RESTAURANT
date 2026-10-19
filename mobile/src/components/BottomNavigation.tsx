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

export type TabType = 'home' | 'saved' | 'cart' | 'offers' | 'profile';

interface BottomNavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { totalItems } = useCart();

  const tabs: {
    id: TabType;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: 'heart-outline',
      activeIcon: 'heart',
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: 'bag-handle-outline',
      activeIcon: 'bag-handle',
    },
    {
      id: 'offers',
      label: 'Offers',
      icon: 'pricetag-outline',
      activeIcon: 'pricetag',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            {/* Active Pill / Indicator on top */}
            <View
              style={[
                styles.indicator,
                isActive && styles.indicatorActive,
              ]}
            />

            <View style={styles.iconWrapper}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? Colors.primaryLight : Colors.textMuted}
              />
              {tab.id === 'cart' && totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF1',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 6,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  indicator: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  indicatorActive: {
    backgroundColor: Colors.primaryLight,
  },
  iconWrapper: {
    position: 'relative',
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: Colors.primary,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
