import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const SERVICES = [
  { icon: 'airplane', label: 'Ndege', desc: 'Tiketi za ndege Tanzania na nje', color: colors.blue, screen: 'FlightSearch', gradient: ['#1e3a5f', '#3b82f6'] },
  { icon: 'boat', label: 'Feri', desc: 'Dar-Zanzibar na visiwa', color: colors.cyan, screen: 'FerryBooking', gradient: ['#0c2f3f', '#22d3ee'] },
  { icon: 'bus', label: 'Basi', desc: 'Basi kila kona ya Tanzania', color: colors.greenLight, screen: 'BusBooking', gradient: ['#052e16', '#4ade80'] },
  { icon: 'train', label: 'SGR', desc: 'Treni ya kisasa DSM-Dodoma', color: colors.red, screen: 'SGRBooking', gradient: ['#3f0f0f', '#f87171'] },
  { icon: 'leaf', label: 'Mbuga za Wanyama', desc: 'Serengeti, Ngorongoro na zaidi', color: colors.emerald, screen: 'NationalParks', gradient: ['#052e16', '#34d399'] },
  { icon: 'bed', label: 'Hoteli', desc: 'Hoteli bora Tanzania yote', color: colors.purple, screen: 'HotelSearch', gradient: ['#2e1065', '#a78bfa'] },
];

const DESTINATIONS = [
  { name: 'Zanzibar', desc: 'Visiwa vya Unguja', image: '🏝️', price: 'TZS 85,000' },
  { name: 'Serengeti', desc: 'Mbuga ya Wanyama', image: '🦁', price: 'TZS 250,000' },
  { name: 'Kilimanjaro', desc: 'Mlima mrefu Afrika', image: '⛰️', price: 'TZS 180,000' },
  { name: 'Dodoma', desc: 'Mji Mkuu', image: '🏙️', price: 'TZS 45,000' },
];

export function TravelScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={['rgba(22,163,74,0.2)', 'transparent']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Safari & Usafiri</Text>
        <Text style={styles.headerSub}>Tiketi, hoteli na zaidi — mahali pamoja</Text>
      </LinearGradient>

      {/* Service Cards */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Chagua Huduma</Text>
        {SERVICES.map((s) => (
          <TouchableOpacity key={s.label} style={styles.serviceCard} onPress={() => navigation.navigate(s.screen)} activeOpacity={0.8}>
            <LinearGradient colors={s.gradient as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.serviceGradient}>
              <View style={[styles.serviceIconWrap, { backgroundColor: `${s.color}30` }]}>
                <Ionicons name={s.icon as any} size={28} color={s.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceLabel}>{s.label}</Text>
                <Text style={styles.serviceDesc}>{s.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Popular Destinations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Maeneo Maarufu</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
          {DESTINATIONS.map((d) => (
            <Card key={d.name} style={styles.destCard}>
              <Text style={styles.destEmoji}>{d.image}</Text>
              <Text style={styles.destName}>{d.name}</Text>
              <Text style={styles.destDesc}>{d.desc}</Text>
              <Text style={styles.destPrice}>Kuanzia {d.price}</Text>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Promo */}
      <View style={styles.section}>
        <LinearGradient colors={['rgba(96,165,250,0.25)', 'rgba(22,163,74,0.15)']} style={styles.promo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Ionicons name="gift" size={32} color={colors.blue} />
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>Punguzo 20% la Ndege!</Text>
            <Text style={styles.promoSub}>Nenda Zanzibar kwa nusu bei · Inaisha Mei 31</Text>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: colors.white40, marginTop: 4 },
  servicesSection: { paddingHorizontal: 16, gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.white, marginBottom: 10 },
  serviceCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 2 },
  serviceGradient: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  serviceIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  serviceLabel: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  serviceDesc: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  destCard: { width: 150, marginRight: 10, alignItems: 'center', paddingVertical: 18 },
  destEmoji: { fontSize: 36, marginBottom: 8 },
  destName: { fontSize: 15, fontWeight: '700', color: colors.white },
  destDesc: { fontSize: 11, color: colors.white40, marginTop: 2, textAlign: 'center' },
  destPrice: { fontSize: 12, color: colors.greenLight, fontWeight: '600', marginTop: 6 },
  promo: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)' },
  promoTitle: { fontSize: 15, fontWeight: '700', color: colors.white },
  promoSub: { fontSize: 12, color: colors.white70, marginTop: 2 },
});
