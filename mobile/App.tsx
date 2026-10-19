import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { MenuProvider } from './src/context/MenuContext';
import { CartProvider } from './src/context/CartContext';
import { AppNavigator } from './src/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MenuProvider>
          <CartProvider>
            <AppNavigator />
            <StatusBar style="light" />
          </CartProvider>
        </MenuProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
