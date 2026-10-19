import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './screens/SplashScreen';
import { AuthScreen } from './screens/AuthScreen';
import { ReferenceHomeScreen } from './screens/customer/ReferenceHomeScreen';
import { ReferenceFoodDetailModal } from './screens/customer/ReferenceFoodDetailModal';
import { CartScreen } from './screens/customer/CartScreen';
import { CheckoutScreen } from './screens/customer/CheckoutScreen';
import { OrderTrackingScreen } from './screens/customer/OrderTrackingScreen';
import { SavedScreen } from './screens/customer/SavedScreen';
import { OffersScreen } from './screens/customer/OffersScreen';
import { ProfileScreen } from './screens/customer/ProfileScreen';
import { AddressManagerModal } from './screens/customer/AddressManagerModal';
import { BottomNavigation, TabType } from './components/BottomNavigation';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { DeliveryDashboardScreen } from './screens/delivery/DeliveryDashboardScreen';
import { DeliveryDetailModal } from './screens/delivery/DeliveryDetailModal';
import { useAuth } from './context/AuthContext';
import { Colors } from './theme/colors';
import { Order } from './types';

type RootFlowState = 'splash' | 'auth' | 'app' | 'checkout' | 'tracking';

export const AppNavigator: React.FC = () => {
  const { currentRole, switchToCustomer, logoutDelivery } = useAuth();

  const [flowState, setFlowState] = useState<RootFlowState>('splash');
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Modals & Sub-screens
  const [selectedFoodItem, setSelectedFoodItem] = useState<any | null>(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [roleSwitcherVisible, setRoleSwitcherVisible] = useState(false);

  // Delivery specific states
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState<Order | null>(null);

  // 1. Splash Screen
  if (flowState === 'splash') {
    return (
      <SplashScreen
        onFinish={() => setFlowState('auth')}
      />
    );
  }

  // 2. Authentication Screen ("Welcome Back")
  if (flowState === 'auth') {
    return (
      <AuthScreen
        onLoginSuccess={() => {
          setFlowState('app');
          setCurrentTab('home');
        }}
      />
    );
  }

  // 3. Checkout Screen
  if (flowState === 'checkout') {
    return (
      <CheckoutScreen
        onBack={() => setFlowState('app')}
        onOrderPlaced={(orderId) => {
          setActiveTrackingOrderId(orderId);
          setFlowState('tracking');
        }}
      />
    );
  }

  // 4. Order Tracking Screen
  if (flowState === 'tracking' && activeTrackingOrderId) {
    return (
      <OrderTrackingScreen
        orderId={activeTrackingOrderId}
        onBackToHome={() => {
          setActiveTrackingOrderId(null);
          setFlowState('app');
          setCurrentTab('home');
        }}
      />
    );
  }

  // 5. Delivery Partner Portal Mode
  if (currentRole === 'delivery') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <DeliveryDashboardScreen
          onSelectOrder={(ord) => setSelectedDeliveryOrder(ord)}
          onOpenProfile={() => setRoleSwitcherVisible(true)}
        />

        {/* Delivery Detail Modal */}
        <DeliveryDetailModal
          order={selectedDeliveryOrder}
          visible={!!selectedDeliveryOrder}
          onClose={() => setSelectedDeliveryOrder(null)}
          onStatusUpdated={(updated) => {
            setSelectedDeliveryOrder(updated);
          }}
        />

        {/* Role Switcher Modal */}
        <RoleSwitcherModal
          visible={roleSwitcherVisible}
          onClose={() => setRoleSwitcherVisible(false)}
          onOpenDeliveryLogin={() => setFlowState('auth')}
        />
      </View>
    );
  }

  // 6. Main Customer App (Tab navigation)
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Screen according to tab */}
      <View style={styles.tabContent}>
        {currentTab === 'home' && (
          <ReferenceHomeScreen
            onSelectItem={(item) => setSelectedFoodItem(item)}
            onNavigateToCart={() => setCurrentTab('cart')}
            onOpenAddressSelector={() => setAddressModalVisible(true)}
            onOpenNotifications={() => setCurrentTab('offers')}
          />
        )}

        {currentTab === 'saved' && (
          <SavedScreen
            onSelectItem={(item) => setSelectedFoodItem(item)}
          />
        )}

        {currentTab === 'cart' && (
          <CartScreen
            onNavigateToHome={() => setCurrentTab('home')}
            onProceedToCheckout={() => setFlowState('checkout')}
          />
        )}

        {currentTab === 'offers' && (
          <OffersScreen
            onNavigateToCart={() => setCurrentTab('cart')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            onOpenSavedAddresses={() => setAddressModalVisible(true)}
            onOpenRoleSwitcher={() => setRoleSwitcherVisible(true)}
            onLogout={() => {
              setFlowState('auth');
            }}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Modals */}
      <ReferenceFoodDetailModal
        item={selectedFoodItem}
        visible={!!selectedFoodItem}
        onClose={() => setSelectedFoodItem(null)}
      />

      <AddressManagerModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
      />

      <RoleSwitcherModal
        visible={roleSwitcherVisible}
        onClose={() => setRoleSwitcherVisible(false)}
        onOpenDeliveryLogin={() => setFlowState('auth')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  tabContent: {
    flex: 1,
  },
});
