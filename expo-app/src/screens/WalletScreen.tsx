import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, Easing, FadeInDown, FadeInLeft,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const { width: W } = Dimensions.get('window');

const MOBILE_MONEY = [
  { id: 'mpesa', name: 'M-Pesa', provider: 'Vodacom', balance: 450_000, color: '#00a550', textColor: '#fff', icon: 'phone-portrait' as const },
  { id: 'airtel', name: 'Airtel Money', provider: 'Airtel', balance: 120_000, color: '#cc0000', textColor: '#fff', icon: 'phone-portrait' as const },
  { id: 'tigo', name: 'Tigo Pesa', provider: 'Tigo', balance: 85_000, color: '#0055cc', textColor: '#fff', icon: 'phone-portrait' as const },
  { id: 'halo', name: 'Halopesa', provider: 'Halotel', balance: 0, color: '#ff6600', textColor: '#fff', icon: 'phone-portrait' as const },
];

const ACTIONS = [
  { icon: 'add-circle-outline' as const, label: 'Weka', color: colors.greenLight, bg: colors.greenDim },
  { icon: 'arrow-up-circle-outline' as const, label: 'Tuma', color: colors.blue, bg: colors.blueDim },
  { icon: 'arrow-down-circle-outline' as const, label: 'Pokea', color: colors.emerald, bg: colors.emeraldDim },
  { icon: 'swap-horizontal-outline' as const, label: 'Badilisha', color: colors.purple, bg: colors.purpleDim },
];

function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: any;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function VirtualCard({ user }: { user: any }) {
  const shimmerX = useSharedValue(-W);
  const cardScale = useSharedValue(0.95);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 110 });
    shimmerX.value = withRepeat(
      withSequence(
        withTiming(W + 120, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
        withTiming(-W, { duration: 0 }),
        withTiming(-W, { duration: 1800 }),
      ),
      -1, false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View style={[styles.cardWrap, cardStyle]}>
      <LinearGradient
        colors={['#052e16', '#0f5132', '#16a34a', '#4ade80']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardTop}>
          <Text style={styles.cardBrand}>goPay</Text>
          <View style={styles.cardChip}>
            <View style={styles.chipInner} />
          </View>
        </View>

        <View style={styles.cardMiddle}>
          <Ionicons name="wifi" size={24} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: '90deg' }] }} />
        </View>

        <Text style={styles.cardNumber}>•••• •••• •••• 4821</Text>

        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardLabelSmall}>MMILIKI</Text>
            <Text style={styles.cardValue}>{user?.name?.toUpperCase() ?? 'JUMA MWANGI'}</Text>
          </View>
          <View>
            <Text style={styles.cardLabelSmall}>INAISHA</Text>
            <Text style={styles.cardValue}>12/28</Text>
          </View>
          <View style={styles.cardMastercardCircles}>
            <View style={[styles.mcCircle, { backgroundColor: '#eb001b' }]} />
            <View style={[styles.mcCircle, { backgroundColor: '#f79e1b', marginLeft: -10 }]} />
          </View>
        </View>

        <Animated.View style={[styles.shimmerStreak, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ width: 90, height: '100%' }}
          />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

function MobileMoneyCard({ item, index }: { item: typeof MOBILE_MONEY[0]; index: number }) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.96, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 260 }),
    );
    Haptics.selectionAsync();
  };

  return (
    <Animated.View entering={FadeInLeft.delay(index * 100).duration(400)} style={styles.mmCard}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
        <Animated.View style={[styles.mmCardInner, pressStyle]}>
          <View style={[styles.mmColorBar, { backgroundColor: item.color }]} />
          <View style={styles.mmContent}>
            <View style={styles.mmTop}>
              <View style={[styles.mmIconBox, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mmName}>{item.name}</Text>
                <Text style={styles.mmProvider}>{item.provider}</Text>
              </View>
              {item.balance > 0 && (
                <View style={styles.mmActiveBadge}>
                  <View style={[styles.mmActiveDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.mmActiveText, { color: item.color }]}>Hai</Text>
                </View>
              )}
            </View>
            <View style={styles.mmAmountRow}>
              <Text style={styles.mmCurrency}>TZS</Text>
              <Text style={[styles.mmBalance, item.balance === 0 && { color: colors.white20 }]}>
                {item.balance.toLocaleString('sw-TZ')}
              </Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function WalletScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const gopayBalance = user?.balance ?? 2_450_000;
  const mmTotal = MOBILE_MONEY.reduce((s, m) => s + m.balance, 0);
  const grandTotal = gopayBalance + mmTotal;

  const displayTotal = useCounter(grandTotal);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['rgba(22,163,74,0.12)', 'transparent']}
        style={[styles.headerGrad, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Pochi Yangu</Text>
            <Text style={styles.headerSub}>Akaunti na kadi zako zote</Text>
          </View>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => { Haptics.selectionAsync(); navigation.navigate('TransactionHistory'); }}
          >
            <Ionicons name="time-outline" size={20} color={colors.white70} />
          </TouchableOpacity>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>JUMLA YA FEDHA</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalCurrency}>TZS</Text>
            <Text style={styles.totalAmount}>{displayTotal.toLocaleString('sw-TZ')}</Text>
          </View>
          <Text style={styles.totalSub}>Akaunti {MOBILE_MONEY.filter(m => m.balance > 0).length + 1} zinazoungwa</Text>
        </View>
      </LinearGradient>

      <View style={styles.actionsRow}>
        {ACTIONS.map((a, i) => (
          <Animated.View key={a.label} entering={FadeInDown.delay(i * 70).duration(350)}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (a.label === 'Tuma') navigation.navigate('SendMoney'); }}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kadi ya Dijitali</Text>
        <VirtualCard user={user} />
        <TouchableOpacity
          style={styles.manageCardBtn}
          onPress={() => { Haptics.selectionAsync(); navigation.navigate('WalletDetail'); }}
        >
          <Text style={styles.manageCardText}>Simamia Kadi</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.greenLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pesa ya Simu</Text>
          <Text style={styles.sectionSub}>
            TZS {mmTotal.toLocaleString('sw-TZ')} jumla
          </Text>
        </View>
        <View style={styles.mmList}>
          {MOBILE_MONEY.map((item, i) => (
            <MobileMoneyCard key={item.id} item={item} index={i} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Viwango vya Ubadilishaji</Text>
        <View style={styles.ratesCard}>
          <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
          {[
            { pair: 'USD / TZS', rate: '2,650', change: '+0.3%', up: true },
            { pair: 'EUR / TZS', rate: '2,870', change: '-0.1%', up: false },
            { pair: 'GBP / TZS', rate: '3,340', change: '+0.8%', up: true },
            { pair: 'KES / TZS', rate: '20.4', change: '+0.2%', up: true },
          ].map((r, i) => (
            <View key={r.pair}>
              <View style={styles.rateRow}>
                <Text style={styles.ratePair}>{r.pair}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.rateValue}>{r.rate}</Text>
                  <Text style={[styles.rateChange, { color: r.up ? colors.greenLight : colors.red }]}>
                    {r.change}
                  </Text>
                </View>
              </View>
              {i < 3 && <View style={styles.rateDivider} />}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerGrad: { paddingHorizontal: 20, paddingBottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.white, letterSpacing: -0.8 },
  headerSub: { fontSize: 12, color: colors.white40, marginTop: 2 },
  historyBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  totalSection: { marginBottom: 24 },
  totalLabel: { fontSize: 11, fontWeight: '700', color: colors.white40, letterSpacing: 1, marginBottom: 8 },
  totalRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  totalCurrency: { fontSize: 16, fontWeight: '600', color: colors.white40, marginBottom: 6 },
  totalAmount: { fontSize: 42, fontWeight: '800', color: colors.white, letterSpacing: -2 },
  totalSub: { fontSize: 12, color: colors.white40, marginTop: 6 },
  actionsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 16, paddingVertical: 4, marginBottom: 8,
  },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIcon: {
    width: 54, height: 54, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  actionLabel: { fontSize: 12, fontWeight: '600', color: colors.white70 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.white, marginBottom: 12 },
  sectionSub: { fontSize: 12, color: colors.greenLight, fontWeight: '600' },
  cardWrap: { borderRadius: 22, overflow: 'hidden', marginBottom: 10 },
  card: { borderRadius: 22, padding: 22, height: 195, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBrand: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  cardChip: {
    width: 30, height: 24, borderRadius: 6,
    backgroundColor: 'rgba(255,215,0,0.5)',
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  chipInner: { width: 18, height: 14, borderRadius: 3, backgroundColor: 'rgba(255,215,0,0.3)' },
  cardMiddle: { flex: 1, justifyContent: 'flex-end', paddingBottom: 6 },
  cardNumber: { fontSize: 17, fontWeight: '600', color: 'rgba(255,255,255,0.9)', letterSpacing: 2, marginBottom: 14 },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  cardLabelSmall: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  cardValue: { fontSize: 13, fontWeight: '700', color: '#fff', marginTop: 2 },
  cardMastercardCircles: { flexDirection: 'row' },
  mcCircle: { width: 28, height: 28, borderRadius: 14, opacity: 0.9 },
  shimmerStreak: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  manageCardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10,
  },
  manageCardText: { fontSize: 13, fontWeight: '600', color: colors.greenLight },
  mmList: { gap: 10 },
  mmCard: { borderRadius: 16, overflow: 'hidden' },
  mmCardInner: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  mmColorBar: { width: 4, borderRadius: 0 },
  mmContent: { flex: 1, padding: 14, gap: 10 },
  mmTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mmIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  mmName: { fontSize: 14, fontWeight: '700', color: colors.white },
  mmProvider: { fontSize: 11, color: colors.white40 },
  mmActiveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
  },
  mmActiveDot: { width: 6, height: 6, borderRadius: 3 },
  mmActiveText: { fontSize: 10, fontWeight: '700' },
  mmAmountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  mmCurrency: { fontSize: 11, fontWeight: '600', color: colors.white40, marginBottom: 2 },
  mmBalance: { fontSize: 20, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  ratesCard: {
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  ratePair: { fontSize: 14, fontWeight: '700', color: colors.white },
  rateValue: { fontSize: 14, fontWeight: '700', color: colors.white },
  rateChange: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  rateDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 14 },
});
