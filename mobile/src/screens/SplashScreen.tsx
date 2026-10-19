import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { ReferenceAssets } from '../theme/assets';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Entrance animation (Fade & Scale up scooter & text)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-proceed after ~2 seconds (as in reference recording)
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        {/* Soft green backdrop circle */}
        <View style={styles.glowCircle} />

        {/* Scooter Courier Illustration */}
        <Image
          source={ReferenceAssets.scooterSplash}
          style={styles.scooterImage}
          resizeMode="contain"
        />

        {/* App Title */}
        <View style={styles.titleRow}>
          <Text style={styles.titleFood}>Food</Text>
          <Text style={styles.titleIe}>ie.</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Delicious food, delivered fast</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    top: 30,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#E7F7DA',
    opacity: 0.7,
  },
  scooterImage: {
    width: width * 0.65,
    height: width * 0.65,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  titleFood: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  titleIe: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.primaryLight,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});
