import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { colors } from '../theme/colors';

type MenuItem = {
  icon: string;
  label: string;
  screen: string | null;
  color: string;
  badge?: string;
};

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Akaunti',
    items: [
      { icon: 'person-outline', label: 'Hariri Wasifu', screen: 'EditProfile', color: colors.blue },
      { icon: 'shield-outline', label: 'Usalama', screen: 'Security', color: colors.green },
      { icon: 'star-outline', label: 'GOrewards', screen: 'GOrewards', color: colors.yellow, badge: 'NEW' },
      { icon: 'card-outline', label: 'Kadi za Dijitali', screen: 'WalletDetail', color: colors.purple },
    ],
  },
  {
    title: 'Fedha',
    items: [
      { icon: 'bar-chart-outline', label: 'Uchunguzi wa Fedha', screen: 'Insights', color: colors.cyan },
      { icon: 'pie-chart-outline', label: 'Bajeti', screen: 'BudgetTracker', color: colors.orange },
      { icon: 'people-outline', label: 'Vikundi vya Pesa', screen: 'GroupPools', color: colors.purple },
      { icon: 'cash-outline', label: 'Mikopo', screen: 'MicroLoans', color: colors.yellow },
    ],
  },
  {
    title: 'Msaada',
    items: [
      { icon: 'chatbubble-outline', label: 'Msaada wa Wateja', screen: 'Support', color: colors.green },
      { icon: 'document-text-outline', label: 'Masharti ya Huduma', screen: null, color: colors.white40 },
      { icon: 'lock-closed-outline', label: 'Sera ya Faragha', screen: null, color: colors.white40 },
    ],
  },
];

export function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Toka', 'Je, unataka kutoka kwenye akaunti?', [
      { text: 'Hapana', style: 'cancel' },
      { text: 'Ndiyo, Toka', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Wasifu Wangu</Text>
      </View>

      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0] ?? 'G'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.phone}>{user?.phone}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="pencil" size={16} color={colors.greenLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>TZS {(user?.balance ?? 0).toLocaleString('sw-TZ')}</Text>
            <Text style={styles.statLabel}>Salio</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{(user?.loyaltyPoints ?? 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Pointi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>Gold</Text>
            <Text style={styles.statLabel}>Hadhi</Text>
          </View>
        </View>
      </Card>

      {/* KYC Status */}
      <Card style={[styles.kycCard, { borderColor: 'rgba(74,222,128,0.3)' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.kycIcon}>
            <Ionicons name="checkmark-circle" size={22} color={colors.greenLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.kycTitle}>Uthibitishaji Umekamilika</Text>
            <Text style={styles.kycSub}>NIDA yako imethibitishwa · Kiwango cha juu KYC</Text>
          </View>
          <Badge label="Kikamilifu" variant="green" />
        </View>
      </Card>

      {/* Menu sections */}
      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Card style={{ padding: 0 }}>
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]}
                onPress={() => item.screen && navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}18` }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.badge && <Badge label={item.badge} variant="green" style={{ marginRight: 4 }} />}
                <Ionicons name="chevron-forward" size={16} color={colors.white40} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.red} />
        <Text style={styles.signOutText}>Toka kwenye Akaunti</Text>
      </TouchableOpacity>

      <Text style={styles.version}>goPay v1.0.0 · Tanzania</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.white },
  profileCard: { margin: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(22,163,74,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(74,222,128,0.4)' },
  avatarText: { fontSize: 24, fontWeight: '800', color: colors.greenLight },
  name: { fontSize: 18, fontWeight: '700', color: colors.white },
  email: { fontSize: 13, color: colors.white70, marginTop: 2 },
  phone: { fontSize: 13, color: colors.white40, marginTop: 1 },
  editBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  statsRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700', color: colors.white },
  statLabel: { fontSize: 11, color: colors.white40, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  kycCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: 'rgba(74,222,128,0.05)' },
  kycIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(74,222,128,0.15)', alignItems: 'center', justifyContent: 'center' },
  kycTitle: { fontSize: 14, fontWeight: '700', color: colors.white },
  kycSub: { fontSize: 12, color: colors.white40, marginTop: 1 },
  section: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.white40, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.white },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)', backgroundColor: 'rgba(248,113,113,0.08)' },
  signOutText: { fontSize: 14, fontWeight: '700', color: colors.red },
  version: { textAlign: 'center', fontSize: 12, color: colors.white40, marginTop: 16, marginBottom: 8 },
});
