import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { colors } from '../theme/colors';

const CATEGORIES = [
  {
    id: 'umeme', title: 'Umeme', icon: 'flash', color: colors.yellow,
    providers: [
      { id: 'tanesco', name: 'TANESCO', desc: 'Umeme wa nyumbani' },
      { id: 'zeco', name: 'ZECO', desc: 'Zanzibar Electricity' },
    ],
  },
  {
    id: 'maji', title: 'Maji', icon: 'water', color: colors.blue,
    providers: [
      { id: 'dawasco', name: 'DAWASCO', desc: 'Dar es Salaam Water' },
      { id: 'ruwasa', name: 'RUWASA', desc: 'Maji vijijini' },
    ],
  },
  {
    id: 'simu', title: 'Airtime', icon: 'call', color: colors.green,
    providers: [
      { id: 'vodacom', name: 'Vodacom', desc: 'Airtime & Data' },
      { id: 'airtel', name: 'Airtel', desc: 'Airtime & Data' },
      { id: 'tigo', name: 'Tigo', desc: 'Airtime & Data' },
      { id: 'halotel', name: 'Halotel', desc: 'Airtime & Data' },
    ],
  },
  {
    id: 'tv', title: 'TV & Internet', icon: 'tv', color: colors.purple,
    providers: [
      { id: 'dstv', name: 'DSTV', desc: 'Satellite TV' },
      { id: 'azam', name: 'Azam TV', desc: 'Azam Television' },
      { id: 'startimes', name: 'StarTimes', desc: 'Digital TV' },
    ],
  },
  {
    id: 'kodi', title: 'Kodi & Nyumba', icon: 'home', color: colors.orange,
    providers: [
      { id: 'rent', name: 'Kodi ya Nyumba', desc: 'Lipa kodi moja kwa moja' },
    ],
  },
  {
    id: 'elimu', title: 'Elimu', icon: 'school', color: colors.cyan,
    providers: [
      { id: 'necta', name: 'NECTA', desc: 'Mtihani wa taifa' },
      { id: 'heslb', name: 'HESLB', desc: 'Mkopo wa elimu' },
    ],
  },
];

export function PaymentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<typeof CATEGORIES[0] | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [ref, setRef] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'list' | 'provider' | 'form' | 'success'>('list');

  const handlePay = () => {
    if (!ref || !amount) { Alert.alert('Jaza sehemu zote'); return; }
    setTimeout(() => setStep('success'), 1000);
  };

  if (step === 'success') {
    return (
      <View style={styles.container}>
        <Header title="Malipo ya Bili" onBack={() => { setStep('list'); setSelected(null); setProvider(null); setRef(''); setAmount(''); }} />
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={72} color={colors.greenLight} />
          </View>
          <Text style={styles.successTitle}>Bili Imelipwa!</Text>
          <Text style={styles.successSub}>{provider?.name} — TZS {parseInt(amount).toLocaleString()}</Text>
          <Card style={styles.receiptCard}>
            <ReceiptRow label="Huduma" value={provider?.name} />
            <ReceiptRow label="Kumbukumbu" value={ref} />
            <ReceiptRow label="Kiasi" value={`TZS ${parseInt(amount).toLocaleString()}`} />
            <ReceiptRow label="Hali" value="Imelipwa ✓" valueColor={colors.greenLight} />
            <ReceiptRow label="Tarehe" value={new Date().toLocaleDateString('sw-TZ')} />
          </Card>
          <Button label="Rudi kwenye Bili" onPress={() => { setStep('list'); setSelected(null); setProvider(null); }} style={{ marginTop: 20, width: '100%' }} size="lg" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Malipo ya Bili"
        onBack={step === 'list' ? undefined : () => {
          if (step === 'form') setStep('provider');
          else if (step === 'provider') setStep('list');
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>

        {step === 'list' && (
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>Chagua Aina ya Bili</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.catItem}
                  onPress={() => { setSelected(cat); setStep('provider'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                  <View style={[styles.catIcon, { backgroundColor: `${cat.color}20` }]}>
                    <Ionicons name={cat.icon as any} size={26} color={cat.color} />
                  </View>
                  <Text style={styles.catLabel}>{cat.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Malipo ya Hivi Karibuni</Text>
            {[
              { name: 'TANESCO', ref: '12345678', amount: '35,000', date: 'Jana' },
              { name: 'Vodacom Airtime', ref: '+255744567890', amount: '10,000', date: '3 Mei' },
              { name: 'DSTV', ref: '1234567890', amount: '85,000', date: '1 Mei' },
            ].map((r, i) => (
              <Card key={i} style={styles.recentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentName}>{r.name}</Text>
                  <Text style={styles.recentRef}>{r.ref}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.recentAmount}>TZS {r.amount}</Text>
                  <Text style={styles.recentDate}>{r.date}</Text>
                </View>
                <TouchableOpacity style={styles.repeatBtn}>
                  <Text style={styles.repeatText}>Rudia</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {step === 'provider' && selected && (
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>Chagua Mtoa Huduma</Text>
            {selected.providers.map((p) => (
              <TouchableOpacity key={p.id} style={styles.providerRow}
                onPress={() => { setProvider(p); setStep('form'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                <View style={[styles.providerIcon, { backgroundColor: `${selected.color}20` }]}>
                  <Ionicons name={selected.icon as any} size={22} color={selected.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.providerName}>{p.name}</Text>
                  <Text style={styles.providerDesc}>{p.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.white40} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'form' && provider && (
          <View style={{ gap: 16 }}>
            <Card style={styles.providerBadge}>
              <View style={[styles.providerIcon, { backgroundColor: `${selected?.color}20` }]}>
                <Ionicons name={selected?.icon as any} size={22} color={selected?.color} />
              </View>
              <Text style={styles.providerName}>{provider.name}</Text>
            </Card>

            <View>
              <Text style={styles.fieldLabel}>Namba ya Kumbukumbu / Akaunti</Text>
              <View style={styles.textInput}>
                <TextInput style={styles.input} value={ref} onChangeText={setRef} placeholder="Weka namba yako..." placeholderTextColor={colors.white20} keyboardType="numeric" />
              </View>
            </View>

            <View>
              <Text style={styles.fieldLabel}>Kiasi (TZS)</Text>
              <View style={styles.textInput}>
                <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="0" placeholderTextColor={colors.white20} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.presetRow}>
              {['5,000', '10,000', '20,000', '50,000'].map((p) => (
                <TouchableOpacity key={p} style={styles.preset} onPress={() => setAmount(p.replace(',', ''))}>
                  <Text style={styles.presetText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button label="Lipa Sasa" onPress={handlePay} size="lg" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ReceiptRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ fontSize: 13, color: colors.white40 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: '600', color: valueColor ?? colors.white }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.white, marginBottom: 4 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catItem: { width: '30%', alignItems: 'center', gap: 8, backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
  catIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 12, fontWeight: '600', color: colors.white70, textAlign: 'center' },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recentName: { fontSize: 14, fontWeight: '600', color: colors.white },
  recentRef: { fontSize: 12, color: colors.white40, marginTop: 1 },
  recentAmount: { fontSize: 14, fontWeight: '700', color: colors.white },
  recentDate: { fontSize: 11, color: colors.white40 },
  repeatBtn: { backgroundColor: colors.greenDim, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  repeatText: { fontSize: 12, fontWeight: '700', color: colors.greenLight },
  providerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
  providerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  providerName: { fontSize: 15, fontWeight: '700', color: colors.white },
  providerDesc: { fontSize: 12, color: colors.white40, marginTop: 2 },
  providerBadge: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.white70, marginBottom: 6 },
  textInput: { backgroundColor: colors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 },
  input: { color: colors.white, fontSize: 16, paddingVertical: 14 },
  presetRow: { flexDirection: 'row', gap: 8 },
  preset: { flex: 1, paddingVertical: 10, backgroundColor: colors.bgCard, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  presetText: { fontSize: 12, fontWeight: '600', color: colors.white70 },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 8 },
  successSub: { fontSize: 14, color: colors.white70, textAlign: 'center', marginBottom: 24 },
  receiptCard: { width: '100%' },
});
