import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withRepeat, withSequence, Easing, FadeInDown, ZoomIn, FadeInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const { width: W } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { icon: 'arrow-up-circle' as const, label: 'Tuma', color: colors.blue, bg: colors.blueDim, screen: 'SendMoney' },
  { icon: 'arrow-down-circle' as const, label: 'Pokea', color: colors.greenLight, bg: colors.greenDim, screen: null },
  { icon: 'qr-code' as const, label: 'Lipa QR', color: colors.purple, bg: colors.purpleDim, screen: 'QRScanner' },
  { icon: 'receipt' as const, label: 'Bili', color: colors.orange, bg: colors.orangeDim, screen: 'Payments' },
];

const SERVICES = [
  { icon: 'airplane' as const, label: 'Ndege', color: colors.blue, screen: 'FlightSearch' },
  { icon: 'boat' as const, label: 'Feri', color: colors.cyan, screen: 'FerryBooking' },
  { icon: 'bus' as const, label: 'Basi', color: colors.greenLight, screen: 'BusBooking' },
  { icon: 'train' as const, label: 'SGR', color: colors.red, screen: 'SGRBooking' },
  { icon: 'leaf' as const, label: 'Mbuga', color: colors.emerald, screen: 'NationalParks' },
  { icon: 'bed' as const, label: 'Hoteli', color: colors.purple, screen: 'HotelSearch' },
  { icon: 'cash' as const, label: 'Mikopo', color: colors.yellow, screen: 'MicroLoans' },
  { icon: 'people' as const, label: 'Vikundi', color: colors.orange, screen: 'GroupPools' },
  { icon: 'globe' as const, label: 'Sarafu', color: colors.cyan, screen: 'MultiCurrency' },
  { icon: 'document-text' as const, label: 'Serikali', color: colors.blue, screen: 'GovernmentServices' },
];

const TRANSACTIONS = [
  { id: '1', icon: 'phone-portrait', name: 'M-Pesa', desc: 'Kutoka Amina Hassan', amount: '+50,000', type: 'credit', time: '2 saa' },
  { id: '2', icon: 'flash', name: 'TANESCO', desc: 'Bili ya umeme - Januari', amount: '-35,000', type: 'debit', time: 'Jana' },
  { id: '3', icon: 'airplane', name: 'Ndege ZNZ', desc: 'Precision Air PW101', amount: '-280,000', type: 'debit', time: 'Juzi' },
  { id: '4', icon: 'arrow-up', name: 'Tuma Pesa', desc: 'Kwa John Mtoto', amount: '-100,000', type: 'debit', time: '3 Mei' },
  { id: '5', icon: 'star', name: 'GOrewards', desc: 'Pointi 240 zimeongezwa', amount: '+240 pts', type: 'reward', time: '2 Mei' },
];

function useCounter(target: number, duration = 1400) {
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

function BalanceCard({ navigation, hidden, onToggleHidden }: {
  navigation: any; hidden: boolean; onToggleHidden: () => void;
}) {
  const balance = useCounter(1_247_830);
  const rewards = useCounter(2840);

  const glowOpacity = useSharedValue(0.4);
  const cardScale = useSharedValue(0.96);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 120 });
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  return (
    <Animated.View style={[styles.balanceCardWrap, cardStyle]}>
      <Animated.View style={[styles.cardGlow, glowStyle]} />
      <LinearGradient
        colors={['#0d2818', '#0a1f12', '#071410']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <View style={styles.balanceCardBorder} />
        <View style={styles.balanceTop}>
          <View>
            <Text style={styles.balanceLabel}>Salio la Akaunti</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceCurrency}>TZS</Text>
              {hidden
                ? <Text style={styles.balanceAmount}>••••••••</Text>
                : <Text style={styles.balanceAmount}>{balance.toLocaleString('sw-TZ')}</Text>
              }
            </View>
          </View>
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => { Haptics.selectionAsync(); onToggleHidden(); }}
          >
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color={colors.white40} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceSeparator} />

        <View style={styles.balanceBottom}>
          <View style={styles.rewardsBadge}>
            <Ionicons name="star" size={13} color={colors.yellow} />
            <Text style={styles.rewardsText}>{rewards.toLocaleString()} Pointi</Text>
          </View>
          <TouchableOpacity
            style={styles.topUpBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('SendMoney'); }}
          >
            <Ionicons name="add" size={14} color={colors.greenLight} />
            <Text style={styles.topUpText}>Weka Pesa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardDotDecor}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={[styles.cardDot, { opacity: 0.06 + i * 0.04 }]} />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function QuickAction({ item, index, navigation }: { item: typeof QUICK_ACTIONS[0]; index: number; navigation: any }) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1, { damping: 8, stiffness: 300 }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.screen) navigation.navigate(item.screen);
  };

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 70).duration(450).springify()} style={styles.quickActionWrap}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View style={pressStyle}>
          <View style={[styles.quickActionIcon, { backgroundColor: item.bg }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <Text style={styles.quickActionLabel}>{item.label}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ServiceItem({ item, index, navigation }: { item: typeof SERVICES[0]; index: number; navigation: any }) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={ZoomIn.delay(100 + index * 50).duration(400)} style={styles.serviceItem}>
      <TouchableOpacity
        onPress={() => {
          scale.value = withSequence(withTiming(0.87, { duration: 70 }), withSpring(1, { damping: 8, stiffness: 280 }));
          Haptics.selectionAsync();
          navigation.navigate(item.screen);
        }}
        activeOpacity={0.8}
      >
        <Animated.View style={pressStyle}>
          <View style={[styles.serviceIcon, { backgroundColor: `${item.color}18` }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <Text style={styles.serviceLabel}>{item.label}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function TxRow({ tx, index }: { tx: typeof TRANSACTIONS[0]; index: number }) {
  const iconColor = tx.type === 'credit' ? colors.greenLight : tx.type === 'reward' ? colors.yellow : colors.white40;
  const amountColor = tx.type === 'credit' ? colors.greenLight : tx.type === 'reward' ? colors.yellow : colors.white;

  return (
    <Animated.View entering={FadeInRight.delay(100 + index * 80).duration(400)} style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={tx.icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txName}>{tx.name}</Text>
        <Text style={styles.txDesc}>{tx.desc}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.txAmount, { color: amountColor }]}>{tx.amount}</Text>
        <Text style={styles.txTime}>{tx.time}</Text>
      </View>
    </Animated.View>
  );
}

export function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  const headerOpacity = useSharedValue(0);
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Karibu';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Habari za asubuhi' : hour < 17 ? 'Habari za mchana' : 'Habari za jioni';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.greenLight}
          colors={[colors.greenLight]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.header, { paddingTop: insets.top + 10 }, headerStyle]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('sw-TZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => { Haptics.selectionAsync(); navigation.navigate('Notifications'); }}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.white} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => { Haptics.selectionAsync(); navigation.navigate('Profile'); }}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'G'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <BalanceCard navigation={navigation} hidden={hidden} onToggleHidden={() => setHidden(h => !h)} />

      <View style={styles.quickActionsSection}>
        {QUICK_ACTIONS.map((item, i) => (
          <QuickAction key={item.label} item={item} index={i} navigation={navigation} />
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.promoBanner}>
        <LinearGradient
          colors={['rgba(22,163,74,0.15)', 'rgba(34,211,238,0.08)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.promoGrad}
        >
          <View style={styles.promoIconBox}>
            <Ionicons name="star" size={20} color={colors.yellow} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>Pata Pointi 2x Leo!</Text>
            <Text style={styles.promoSub}>Lipa kwa QR kupata mara mbili ya GOrewards</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.greenLight} />
        </LinearGradient>
      </Animated.View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Huduma Zote</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Travel')}>
            <Text style={styles.sectionLink}>Ona Zaidi</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.servicesGrid}>
          {SERVICES.map((item, i) => (
            <ServiceItem key={item.label} item={item} index={i} navigation={navigation} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Miamala ya Hivi Karibuni</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
            <Text style={styles.sectionLink}>Historia Yote</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.txCard}>
          {TRANSACTIONS.map((tx, i) => (
            <View key={tx.id}>
              <TxRow tx={tx} index={i} />
              {i < TRANSACTIONS.length - 1 && <View style={styles.txDivider} />}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const ICON_SIZE = (W - 32 - 40) / 5;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  headerLeft: { gap: 2 },
  greeting: { fontSize: 18, fontWeight: '700', color: colors.white, letterSpacing: -0.3 },
  date: { fontSize: 12, color: colors.white40 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { position: 'relative', padding: 6 },
  notifDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.red,
    borderWidth: 1.5, borderColor: colors.bg,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(74,222,128,0.5)',
    overflow: 'hidden',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: '#000', zIndex: 1 },
  balanceCardWrap: { marginHorizontal: 16, marginBottom: 6, position: 'relative' },
  cardGlow: {
    position: 'absolute', left: 20, right: 20, bottom: -10, height: 60,
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderRadius: 30,
    shadowColor: colors.greenLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  balanceCard: {
    borderRadius: 22, padding: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.18)',
  },
  balanceCardBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    backgroundColor: 'rgba(74,222,128,0.35)', borderRadius: 1,
  },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  balanceLabel: { fontSize: 11, fontWeight: '600', color: colors.white40, letterSpacing: 0.8, marginBottom: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  balanceCurrency: { fontSize: 14, color: colors.white40, marginBottom: 4, fontWeight: '600' },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: colors.white, letterSpacing: -1.5 },
  eyeBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  balanceSeparator: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
  balanceBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rewardsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)',
  },
  rewardsText: { fontSize: 12, fontWeight: '700', color: colors.yellow },
  topUpBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.greenDim,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.borderGreen,
  },
  topUpText: { fontSize: 12, fontWeight: '700', color: colors.greenLight },
  cardDotDecor: { flexDirection: 'row', gap: 8, position: 'absolute', top: 16, right: 16 },
  cardDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.greenLight },
  quickActionsSection: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 12, paddingVertical: 20,
  },
  quickActionWrap: { alignItems: 'center' },
  quickActionIcon: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  quickActionLabel: { fontSize: 12, fontWeight: '600', color: colors.white70 },
  promoBanner: { marginHorizontal: 16, marginBottom: 8, borderRadius: 16, overflow: 'hidden' },
  promoGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)', borderRadius: 16,
  },
  promoIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(251,191,36,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  promoTitle: { fontSize: 13, fontWeight: '700', color: colors.white, marginBottom: 2 },
  promoSub: { fontSize: 11, color: colors.white40 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.white },
  sectionLink: { fontSize: 13, color: colors.greenLight, fontWeight: '600' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceItem: { width: ICON_SIZE, alignItems: 'center', gap: 6 },
  serviceIcon: {
    width: ICON_SIZE - 4, height: ICON_SIZE - 4,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  serviceLabel: { fontSize: 10, color: colors.white70, fontWeight: '600', textAlign: 'center' },
  txCard: {
    backgroundColor: colors.bgCard, borderRadius: 18,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  txIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  txName: { fontSize: 14, fontWeight: '700', color: colors.white },
  txDesc: { fontSize: 12, color: colors.white40, marginTop: 1 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txTime: { fontSize: 11, color: colors.white40, marginTop: 2 },
  txDivider: { height: 1, backgroundColor: colors.border, marginLeft: 70 },
});
