import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Dimensions, ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withRepeat, withSequence, withDelay, Easing,
  FadeIn, FadeInDown, SlideInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const { width: W, height: H } = Dimensions.get('window');

function FloatingOrb({ x, y, size, color, delay }: {
  x: number; y: number; size: number; color: string; delay: number;
}) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 900 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 3400 + delay * 0.4, easing: Easing.inOut(Easing.sin) }),
          withTiming(20, { duration: 3400 + delay * 0.4, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, true,
      ),
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.14, { duration: 4200 + delay * 0.2, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.88, { duration: 4200 + delay * 0.2, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.42,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[{
        position: 'absolute', left: x, top: y,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
      }, style]}
    />
  );
}

function InputField({ label, value, onChange, placeholder, icon, keyboardType, secureTextEntry, onToggleSecure }: any) {
  const [focused, setFocused] = useState(false);
  const glow = useSharedValue(0);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    borderColor: colors.greenLight,
    shadowOpacity: glow.value * 0.4,
  }));

  return (
    <View style={iStyles.wrapper}>
      <Text style={iStyles.label}>{label}</Text>
      <View style={[iStyles.field, focused && iStyles.fieldFocused]}>
        <Animated.View style={[StyleSheet.absoluteFill, iStyles.glowBorder, glowStyle]} />
        <Ionicons
          name={icon}
          size={17}
          color={focused ? colors.greenLight : colors.white40}
          style={{ marginRight: 2 }}
        />
        <TextInput
          style={iStyles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.white20}
          keyboardType={keyboardType ?? 'default'}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          onFocus={() => { setFocused(true); glow.value = withTiming(1, { duration: 200 }); }}
          onBlur={() => { setFocused(false); glow.value = withTiming(0, { duration: 200 }); }}
        />
        {onToggleSecure && (
          <TouchableOpacity onPress={onToggleSecure} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
              size={17}
              color={colors.white40}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const iStyles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 11, fontWeight: '700', color: colors.white40, letterSpacing: 0.8 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, overflow: 'hidden',
  },
  fieldFocused: { borderColor: 'rgba(74,222,128,0.35)' },
  glowBorder: {
    borderRadius: 14, borderWidth: 1, borderColor: colors.greenLight,
    shadowColor: colors.greenLight, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0, shadowRadius: 10,
  },
  input: { flex: 1, color: colors.white, fontSize: 15, paddingVertical: 14 },
});

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const logoPulse = useSharedValue(1);
  const tabIndicatorX = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 11, stiffness: 90 });
    logoOpacity.value = withTiming(1, { duration: 700 });
    logoPulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
  }, []);

  useEffect(() => {
    const half = (W - 40) / 2;
    tabIndicatorX.value = withSpring(mode === 'login' ? 0 : half, { damping: 16, stiffness: 200 });
  }, [mode]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  const logoPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoPulse.value }],
    opacity: 0.12 + (logoPulse.value - 0.95) * 0.8,
  }));
  const tabPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorX.value }],
  }));

  const handleSubmit = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Tafadhali jaza sehemu zote');
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        if (!name || !phone) { Alert.alert('Tafadhali jaza sehemu zote'); return; }
        await signUp({ email, password, name, phone });
      }
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hitilafu', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    await signIn('demo@gopay.tz', 'demo123');
    setLoading(false);
  };

  return (
    <View style={styles.root}>
      <FloatingOrb x={-70} y={H * 0.04} size={280} color="#16a34a" delay={0} />
      <FloatingOrb x={W - 160} y={H * 0.52} size={240} color="#34d399" delay={500} />
      <FloatingOrb x={W * 0.15} y={H * 0.28} size={160} color="#22d3ee" delay={250} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.hero, logoStyle]}>
            <Animated.View style={[styles.logoGlow, logoPulseStyle]} />
            <View style={styles.logoBox}>
              <Ionicons name="wallet" size={36} color={colors.greenLight} />
            </View>
            <Text style={styles.appName}>goPay</Text>
            <Text style={styles.tagline}>Pochi yako ya dijitali Tanzania</Text>
          </Animated.View>

          <View style={styles.featuresRow}>
            {[
              { icon: 'shield-checkmark' as const, label: 'Salama 256-bit' },
              { icon: 'flash' as const, label: 'Papo Hapo' },
              { icon: 'phone-portrait' as const, label: 'Rahisi Kutumia' },
            ].map((f, i) => (
              <Animated.View
                key={f.label}
                entering={FadeInDown.delay(400 + i * 100).duration(500)}
                style={styles.feature}
              >
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon} size={14} color={colors.greenLight} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </Animated.View>
            ))}
          </View>

          <Animated.View entering={SlideInDown.delay(200).duration(700).springify()} style={styles.card}>
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.cardContent}>
              <View style={styles.tabRow}>
                <Animated.View style={[styles.tabPill, tabPillStyle]} />
                {(['login', 'signup'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={styles.tabItem}
                    onPress={() => { setMode(m); Haptics.selectionAsync(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                      {m === 'login' ? 'Ingia' : 'Jisajili'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formGap}>
                {mode === 'signup' && (
                  <>
                    <Animated.View entering={FadeInDown.duration(300)}>
                      <InputField label="JINA KAMILI" value={name} onChange={setName} placeholder="Juma Mwangi" icon="person-outline" />
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(60).duration(300)}>
                      <InputField label="NAMBA YA SIMU" value={phone} onChange={setPhone} placeholder="+255 7XX XXX XXX" icon="call-outline" keyboardType="phone-pad" />
                    </Animated.View>
                  </>
                )}
                <InputField label="BARUA PEPE" value={email} onChange={setEmail} placeholder="juma@mfano.co.tz" icon="mail-outline" keyboardType="email-address" />
                <InputField label="NYWILA" value={password} onChange={setPassword} placeholder="••••••••" icon="lock-closed-outline" secureTextEntry={!showPass} onToggleSecure={() => setShowPass(p => !p)} />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.72 }]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#22c55e', '#16a34a', '#15803d']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.submitGrad}
                >
                  <Text style={styles.submitText}>
                    {loading ? 'Inapakia...' : mode === 'login' ? 'Ingia Sasa →' : 'Fungua Akaunti →'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.divLine} />
                <Text style={styles.divText}>au endelea na</Text>
                <View style={styles.divLine} />
              </View>

              <TouchableOpacity style={styles.demoBtn} onPress={handleDemo} activeOpacity={0.75}>
                <View style={styles.demoIconBox}>
                  <Ionicons name="play" size={12} color={colors.greenLight} />
                </View>
                <Text style={styles.demoBtnText}>Anza Demo ya Bure</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.greenLight} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(800).duration(600)} style={styles.footer}>
            <Ionicons name="shield-checkmark" size={12} color={colors.white20} />
            <Text style={styles.footerText}>Imelindwa na Benki Kuu ya Tanzania</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20 },
  hero: { alignItems: 'center', marginBottom: 20 },
  logoGlow: {
    position: 'absolute',
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: colors.greenLight,
    top: -18,
  },
  logoBox: {
    width: 82, height: 82, borderRadius: 26,
    backgroundColor: 'rgba(22,163,74,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.4)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.greenLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: { fontSize: 40, fontWeight: '800', color: colors.white, letterSpacing: -2, marginBottom: 5 },
  tagline: { fontSize: 14, color: colors.white40, letterSpacing: 0.2 },
  featuresRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  feature: { alignItems: 'center', gap: 5 },
  featureIconWrap: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.greenDim, borderWidth: 1, borderColor: colors.borderGreen,
    alignItems: 'center', justifyContent: 'center',
  },
  featureLabel: { fontSize: 10, fontWeight: '700', color: colors.white40, letterSpacing: 0.2 },
  card: {
    borderRadius: 26, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.borderBright,
    marginBottom: 18,
  },
  cardContent: { padding: 20, gap: 16 },
  tabRow: {
    flexDirection: 'row', backgroundColor: colors.bgCard,
    borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', position: 'relative',
  },
  tabPill: {
    position: 'absolute', top: 4, left: 4, bottom: 4,
    width: '50%', backgroundColor: colors.greenLight, borderRadius: 11,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10, zIndex: 1 },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.white40 },
  tabTextActive: { color: '#000' },
  formGap: { gap: 14 },
  submitBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  submitGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 0.2 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: colors.border },
  divText: { fontSize: 11, color: colors.white40 },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderRadius: 14,
    borderWidth: 1, borderColor: colors.borderGreen, backgroundColor: colors.greenDim,
  },
  demoIconBox: {
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: 'rgba(74,222,128,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  demoBtnText: { fontSize: 14, fontWeight: '700', color: colors.greenLight },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  footerText: { fontSize: 11, color: colors.white20 },
});
