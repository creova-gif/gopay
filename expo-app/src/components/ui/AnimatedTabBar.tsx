import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Dimensions,
  StyleSheet, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  withSequence, withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_COUNT = 5;
const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT;

const TABS_CONFIG = [
  { name: 'Home', icon: 'home' as const, iconOutline: 'home-outline' as const, label: 'Nyumbani' },
  { name: 'Wallet', icon: 'wallet' as const, iconOutline: 'wallet-outline' as const, label: 'Pochi' },
  { name: 'Payments', icon: 'receipt' as const, iconOutline: 'receipt-outline' as const, label: 'Malipo' },
  { name: 'Travel', icon: 'airplane' as const, iconOutline: 'airplane-outline' as const, label: 'Safari' },
  { name: 'Profile', icon: 'person' as const, iconOutline: 'person-outline' as const, label: 'Mimi' },
];

export function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pillX = useSharedValue(0);

  useEffect(() => {
    pillX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    });
  }, [state.index]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const tabBarHeight = 58 + insets.bottom;

  return (
    <View style={[styles.wrapper, { height: tabBarHeight }]}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.topBorder} />

      <Animated.View style={[styles.pill, pillStyle]} />

      <View style={styles.tabs}>
        {TABS_CONFIG.map((tab, index) => {
          const isActive = state.index === index;
          return (
            <TabItem
              key={tab.name}
              tab={tab}
              isActive={isActive}
              onPress={() => {
                Haptics.selectionAsync();
                const event = navigation.emit({
                  type: 'tabPress',
                  target: state.routes[index]?.key,
                  canPreventDefault: true,
                });
                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(tab.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({ tab, isActive, onPress }: {
  tab: typeof TABS_CONFIG[0];
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    glowOpacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.75, { duration: 70 }),
      withSpring(1, { damping: 8, stiffness: 250 }),
    );
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.glowCircle, glowStyle]} />
      <Animated.View style={iconStyle}>
        <Ionicons
          name={isActive ? tab.icon : tab.iconOutline}
          size={22}
          color={isActive ? colors.greenLight : colors.white40}
        />
      </Animated.View>
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  pill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: TAB_WIDTH,
    height: 2,
    backgroundColor: colors.greenLight,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    shadowColor: colors.greenLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  tabs: {
    flexDirection: 'row',
    height: 58,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 58,
  },
  glowCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.greenDim,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white40,
  },
  labelActive: {
    color: colors.greenLight,
  },
});
