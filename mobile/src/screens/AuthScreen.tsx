import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

const ISLANDS = [
  'Amini',
  'Kavaratti',
  'Agatti',
  'Andrott',
  'Kalpeni',
  'Kadmat',
  'Kiltan',
  'Chetlat',
  'Minicoy',
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const {
    loginCustomerAuth,
    registerCustomerAuth,
    loginDelivery,
    switchToCustomer,
  } = useAuth();

  const { updateCustomerInfo, updateDeliveryAddress } = useCart();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign In fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regIsland, setRegIsland] = useState('Amini');
  const [regHouse, setRegHouse] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Errors
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time Sign In
  const handleSignIn = async () => {
    setErrorMessage(null);

    const idVal = loginIdentifier.trim();
    if (!idVal) {
      setErrorMessage('Please enter your phone number or email.');
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // 1. Check if user is logging in as delivery partner
      if (idVal.includes('delivery') || idVal === '9447200001' || idVal === '9447200002') {
        const delRes = await loginDelivery(idVal, loginPassword);
        if (delRes.success) {
          setLoading(false);
          onLoginSuccess();
          return;
        }
      }

      // 2. Perform real-time customer login against Neon DB
      const res = await loginCustomerAuth(idVal, loginPassword);

      if (res.success && res.customer) {
        // Sync customer profile with cart & addresses
        updateCustomerInfo({
          name: res.customer.name,
          phone: res.customer.phone,
          email: res.customer.email || '',
          island: res.customer.island || 'Amini',
          houseName: res.customer.houseName || '',
        });

        if (res.customer.houseName) {
          updateDeliveryAddress({
            id: 'addr-primary',
            label: 'Home',
            fullName: res.customer.name,
            phone: res.customer.phone,
            island: res.customer.island || 'Amini',
            houseName: res.customer.houseName,
            locality: res.customer.locality || '',
            landmark: res.customer.landmark || '',
            isDefault: true,
          });
        }

        setLoading(false);
        onLoginSuccess();
      } else {
        setLoading(false);
        setErrorMessage(res.error || 'Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Unable to connect to server. Please check your network.');
    }
  };

  // Real-time Registration
  const handleRegister = async () => {
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerCustomerAuth({
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim(),
        password: regPassword,
        island: regIsland,
        houseName: regHouse.trim(),
      });

      if (res.success && res.customer) {
        updateCustomerInfo({
          name: res.customer.name,
          phone: res.customer.phone,
          email: res.customer.email || '',
          island: res.customer.island || 'Amini',
          houseName: res.customer.houseName || '',
        });

        updateDeliveryAddress({
          id: 'addr-primary',
          label: 'Home',
          fullName: res.customer.name,
          phone: res.customer.phone,
          island: res.customer.island || 'Amini',
          houseName: res.customer.houseName || 'Home',
          locality: '',
          landmark: '',
          isDefault: true,
        });

        setLoading(false);
        Alert.alert(
          'Account Created',
          `Welcome to Alfiya Kitchen, ${res.customer.name}!`,
          [{ text: 'Start Ordering', onPress: onLoginSuccess }]
        );
      } else {
        setLoading(false);
        setErrorMessage(res.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Network error during registration.');
    }
  };

  const handleGuestContinue = () => {
    switchToCustomer();
    onLoginSuccess();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Card */}
        <View style={styles.heroContainer}>
          <View style={styles.heroLeft}>
            <Text style={styles.restaurantBrand}>Alfiya Kitchen</Text>
            <Text style={styles.restaurantTagline}>Good Food. Great Moments.</Text>
            <Text style={styles.heroIslandNotice}>Lakshadweep Island Delivery</Text>
          </View>

          <View style={styles.heroRight}>
            <View style={styles.heroIconBadge}>
              <Ionicons name="restaurant" size={32} color={Colors.white} />
            </View>
          </View>
        </View>

        {/* Tab Switcher: Sign In vs Create Account */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'signin' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('signin');
              setErrorMessage(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabButtonText, activeTab === 'signin' && styles.tabButtonTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'register' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabButtonText, activeTab === 'register' && styles.tabButtonTextActive]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Notification Alert */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        {/* =========================================
            SIGN IN FORM
           ========================================= */}
        {activeTab === 'signin' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to track orders and reorder favorites</Text>

            {/* Email / Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number or Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 9447200000 or email"
                  placeholderTextColor={Colors.textMuted}
                  value={loginIdentifier}
                  onChangeText={(val) => {
                    setLoginIdentifier(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showLoginPassword}
                  value={loginPassword}
                  onChangeText={(val) => {
                    setLoginPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowLoginPassword(!showLoginPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In CTA */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeRow}
              onPress={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
            >
              <Text style={styles.switchModeText}>
                Don't have an account? <Text style={styles.switchModeBold}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =========================================
            REGISTER (CREATE ACCOUNT) FORM
           ========================================= */}
        {activeTab === 'register' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>Join Alfiya Kitchen for fast Lakshadweep delivery</Text>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Mohammed Nibras"
                  placeholderTextColor={Colors.textMuted}
                  value={regName}
                  onChangeText={setRegName}
                />
              </View>
            </View>

            {/* Mobile Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number (10 Digits) *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 9447200000"
                  placeholderTextColor={Colors.textMuted}
                  value={regPhone}
                  onChangeText={setRegPhone}
                  keyboardType="phone-pad"
                  maxLength={13}
                />
              </View>
            </View>

            {/* Email (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. yourname@gmail.com"
                  placeholderTextColor={Colors.textMuted}
                  value={regEmail}
                  onChangeText={setRegEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Select Island */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Your Island *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.islandRow}>
                {ISLANDS.map((isl) => (
                  <TouchableOpacity
                    key={isl}
                    style={[styles.islandChip, regIsland === isl && styles.islandChipActive]}
                    onPress={() => setRegIsland(isl)}
                  >
                    <Text style={[styles.islandChipText, regIsland === isl && styles.islandChipTextActive]}>
                      {isl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* House Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>House Name / Delivery Landmark</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="home-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Baitul Noor / Near Post Office"
                  placeholderTextColor={Colors.textMuted}
                  value={regHouse}
                  onChangeText={setRegHouse}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Create Password (Min 6 chars) *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Choose a strong password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showRegPassword}
                  value={regPassword}
                  onChangeText={setRegPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowRegPassword(!showRegPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showRegPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register CTA */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Create Account</Text>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeRow}
              onPress={() => {
                setActiveTab('signin');
                setErrorMessage(null);
              }}
            >
              <Text style={styles.switchModeText}>
                Already have an account? <Text style={styles.switchModeBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Continue as Guest option */}
        <TouchableOpacity
          style={styles.guestBtn}
          onPress={handleGuestContinue}
          activeOpacity={0.7}
        >
          <Text style={styles.guestBtnText}>Explore Menu as Guest</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroContainer: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  heroLeft: {
    flex: 1,
  },
  restaurantBrand: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  restaurantTagline: {
    fontSize: 14,
    color: '#FEF3C7',
    fontWeight: '600',
    marginTop: 2,
  },
  heroIslandNotice: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroRight: {
    marginLeft: 12,
  },
  heroIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },

  /* Tab switcher */
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabButtonTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },

  /* Error banner */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
  },

  /* Form Card */
  formCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  formSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 18,
  },

  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },

  /* Island selector chips */
  islandRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  islandChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  islandChipActive: {
    backgroundColor: Colors.primary,
  },
  islandChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  islandChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },

  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 8,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },

  switchModeRow: {
    alignItems: 'center',
    marginTop: 14,
  },
  switchModeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  switchModeBold: {
    color: Colors.primary,
    fontWeight: '700',
  },

  guestBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 20,
    paddingVertical: 10,
  },
  guestBtnText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
