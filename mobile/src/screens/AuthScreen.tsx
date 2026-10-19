import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ReferenceAssets } from '../theme/assets';
import { useAuth } from '../context/AuthContext';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

const { width } = Dimensions.get('window');

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const { loginDelivery, switchToCustomer } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('dailyflutterui@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);

  // Errors matching reference video
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    setEmailOrPhone(val);
    if (!val.trim()) {
      setEmailError('Please enter your email or phone');
      return;
    }
    // If it contains @ but does not look like a valid email yet
    if (val.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError("That email doesn't look right");
    } else {
      setEmailError(null);
    }
  };

  const validatePassword = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordError('Please enter your password');
    } else if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError(null);
    }
  };

  const handleLogin = async () => {
    // Check validation
    if (!emailOrPhone.trim()) {
      setEmailError('Please enter your email or phone');
      return;
    }
    if (emailOrPhone.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone)) {
      setEmailError("That email doesn't look right");
      return;
    }
    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // Simulate authentic login animation as seen in reference frames 070-072
    setTimeout(async () => {
      // If delivery phone number or specific role
      if (emailOrPhone.includes('delivery') || emailOrPhone === '9447200001' || emailOrPhone === '9447200002') {
        try {
          await loginDelivery(emailOrPhone, password);
        } catch (e) {
          // Fallback to customer if delivery login fails
          switchToCustomer();
        }
      } else {
        switchToCustomer();
      }

      setLoading(false);
      onLoginSuccess();
    }, 1200);
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
        {/* Top Curved Hero Header (Matches reference frame 035) */}
        <View style={styles.heroContainer}>
          <View style={styles.heroLeft}>
            <View style={styles.logoRow}>
              <Text style={styles.logoFood}>Food</Text>
              <Text style={styles.logoIe}>ie.</Text>
            </View>
            <Text style={styles.heroTagline}>
              {'Hot meals,\nright at your door.'}
            </Text>
          </View>

          <View style={styles.heroRight}>
            <Image
              source={ReferenceAssets.scooterLogin}
              style={styles.scooterHeroImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Main Form Body */}
        <View style={styles.formCard}>
          <Text style={styles.heading}>Welcome Back</Text>

          {/* Email / Phone Input */}
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                emailError ? styles.inputWrapperError : null,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={emailError ? Colors.danger : Colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Email or phone"
                placeholderTextColor={Colors.textMuted}
                value={emailOrPhone}
                onChangeText={validateEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                passwordError ? styles.inputWrapperError : null,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={passwordError ? Colors.danger : Colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={validatePassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Keep signed in & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setKeepSignedIn(!keepSignedIn)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  keepSignedIn && styles.checkboxChecked,
                ]}
              >
                {keepSignedIn && (
                  <Ionicons name="checkmark" size={14} color={Colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Keep me signed in</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Log In Button (Matches Frame 070 loading state) */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <Text style={styles.dividerText}>Or continue with</Text>
          </View>

          {/* Social Logins */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={onLoginSuccess}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={onLoginSuccess}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Sign Up */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onLoginSuccess}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingBottom: 30,
  },
  heroContainer: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  heroLeft: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  logoFood: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  logoIe: {
    fontSize: 30,
    fontWeight: '800',
    color: '#B5F169',
    letterSpacing: -0.5,
  },
  heroTagline: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 18,
    fontWeight: '500',
  },
  heroRight: {
    width: 140,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scooterHeroImage: {
    width: '100%',
    height: '100%',
  },
  formCard: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  inputWrapperError: {
    borderColor: Colors.inputBorderError,
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    height: '100%',
  },
  errorText: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 6,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxChecked: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dividerRow: {
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  signUpText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
});
