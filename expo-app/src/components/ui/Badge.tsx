import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';

type BadgeVariant = 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  green: { bg: 'rgba(74,222,128,0.15)', text: colors.greenLight },
  red: { bg: 'rgba(248,113,113,0.15)', text: colors.red },
  blue: { bg: 'rgba(96,165,250,0.15)', text: colors.blue },
  orange: { bg: 'rgba(251,146,60,0.15)', text: colors.orange },
  purple: { bg: 'rgba(167,139,250,0.15)', text: colors.purple },
  default: { bg: colors.bgCard, text: colors.white70 },
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const c = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
