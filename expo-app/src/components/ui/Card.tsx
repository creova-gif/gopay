import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'bright' | 'green';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  default: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bright: {
    backgroundColor: colors.bgCardHover,
    borderWidth: 1,
    borderColor: colors.borderBright,
  },
  green: {
    backgroundColor: colors.greenDim,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
  },
});
