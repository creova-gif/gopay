import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Dimensions,
  StyleSheet, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  withSequence, withTiming, interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_W = SCREEN_WIDTH - 32;
const ACTIVE_W = 108;
const INACTIVE_W = (CONTAINER_W - ACTIVE_W) / 4;
const BAR_HEIGHT = 60;

const TABS = [
  { name: 'Home',     icon: 'home'     as const, outline: 'home-outline'     as const, label: 'Nyumbani' },
  { name: 'Wallet',   icon: 'wallet'   as const, outline: 'wallet-outline'   as const, label: 'Pochi'    },
  { name: 'Payments', icon: 'receipt'  as const, outline: 'receipt-outline'  as const, label: 'Malipo'   },
  { name: 'Travel',   icon: 'airplane' as const, outline: 'airplane-outline' as const, label: 'Safari'   },
  { name: 'Profile',  icon: 'person'   as const, outline: 'person-outline'   as const, label: 'Mimi'     },
];

export function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const w0 = useSharedValue(0 === state.index ? ACTIVE_W : INACTIVE_W);
  const w1 = useSharedValue(1 === state.index ? ACTIVE_W : INACTIVE_W);
  const w2 = useSharedValue(2 === state.index ? ACTIVE_W : INACTIVE_W);
  const w3 = useSharedValue(3 === state.index ? ACTIVE_W : INACTIVE_W);
  const w4 = useSharedValue(4 === state.index ? ACTIVE_W : INACTIVE_W);
  const widths = [w0, w1, w2, w3, w4];

  useEffect(() => {
    widths.forEach((w, i) => {
      w.value = withSpring(i === state.index ? ACTIVE_W : INACTIVE_W, {
        damping: 20,
        stiffness: 220,
        mass: 0.7,
      });
    });
  }, [state.index]);

  return (
    <View
      style={[
        styles.floatWrapper,
        { bottom: Math.max(insets.bottom, 8) + 10 },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.shadowRing} />
      <View style={styles.container}>
        <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.innerBorder} />
        <View style={styles.row}>
          {TABS.map((tab, i) => (
            <PillTab
              key={tab.name}
              tab={tab}
              isActive={state.index === i}
              widthSV={widths[i]}
              onPress={() => {
                Haptics.selectionAsync();
                const event = navigation.emit({
                  type: 'tabPress',
                  target: state.routes[i]?.key,
                  canPreventDefault: true,
                });
                if (state.index !== i && !event.defaultPrevented) {
                  navigation.navigate(tab.name);
                }
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface PillTabProps {
  tab: typeof TABS[0];
  isActive: boolean;
  widthSV: Animated.SharedValue<number>;
  onPress: () => void;
}

function PillTab({ tab, isActive, widthSV, onPress }: PillTabProps) {
  const pressScale = useSharedValue(1);
  const iconScale = useSharedValue(isActive ? 1.1 : 1);

  useEffect(() => {
    iconScale.value = withSpring(isActive ? 1.1 : 1, { damping: 12, stiffness: 200 });
  }, [isActive]);

  const containerStyle = useAnimatedStyle(() => ({
    width: widthSV.value,
    transform: [{ scale: pressScale.value }],
  }));

  const bgOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(widthSV.value, [INACTIVE_W, INACTIVE_W + 30, ACTIVE_W], [0, 0, 1]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(widthSV.value, [INACTIVE_W, INACTIVE_W + 20, ACTIVE_W], [0, 0, 1]),
    width: interpolate(widthSV.value, [INACTIVE_W, ACTIVE_W], [0, 58]),
  }));

  const iconColor = useAnimatedStyle(() => ({
    opacity: interpolate(widthSV.value, [INACTIVE_W, ACTIVE_W], [0.45, 1]),
  }));

  const handlePress = () => {
    pressScale.value = withSequence(
      withTiming(0.88, { duration: 80 }),
      withSpring(1, { damping: 6, stiffness: 300 }),
    );
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View style={[styles.pill, containerStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.pillBg, bgOpacity]}>
          <LinearGradient
            colors={['rgba(74,222,128,0.22)', 'rgba(22,163,74,0.14)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.pillBorder} />
        </Animated.View>

        <Animated.View style={[styles.iconWrap, iconColor]}>
          <Ionicons
            name={isActive ? tab.icon : tab.outline}
            size={20}
            color={isActive ? colors.greenLight : colors.white}
          />
        </Animated.View>

        <Animated.Text
          numberOfLines={1}
          style={[styles.pillLabel, labelStyle]}
        >
          {tab.label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  shadowRing: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: -4,
    height: BAR_HEIGHT + 8,
    borderRadius: BAR_HEIGHT,
    backgroundColor: 'rgba(74,222,128,0.07)',
    shadowColor: colors.greenLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  container: {
    width: CONTAINER_W,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 4,
    overflow: 'hidden',
  },
  pill: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pillBg: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  pillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.greenLight,
    overflow: 'hidden',
    letterSpacing: 0.1,
  },
});
