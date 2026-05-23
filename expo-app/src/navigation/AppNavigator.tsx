import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { AnimatedTabBar } from '../components/ui/AnimatedTabBar';

import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';
import { TravelScreen } from '../screens/TravelScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SendMoneyScreen } from '../screens/SendMoneyScreen';
import { FlightSearchScreen } from '../screens/FlightSearchScreen';
import { GOrewardsScreen } from '../screens/GOrewardsScreen';
import { MicroLoansScreen } from '../screens/MicroLoansScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Travel" component={TravelScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <View style={{
          width: 70, height: 70, borderRadius: 22,
          backgroundColor: 'rgba(22,163,74,0.15)',
          borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.3)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="wallet" size={30} color={colors.greenLight} />
        </View>
        <ActivityIndicator size="small" color={colors.greenLight} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen
              name="SendMoney"
              component={SendMoneyScreen}
              options={{ presentation: 'card', gestureEnabled: true }}
            />
            <Stack.Screen name="FlightSearch" component={FlightSearchScreen} />
            <Stack.Screen name="GOrewards" component={GOrewardsScreen} />
            <Stack.Screen name="MicroLoans" component={MicroLoansScreen} />
            <Stack.Screen name="FerryBooking" component={PlaceholderScreen('Feri', colors.cyan, 'boat')} />
            <Stack.Screen name="BusBooking" component={PlaceholderScreen('Basi', colors.greenLight, 'bus')} />
            <Stack.Screen name="SGRBooking" component={PlaceholderScreen('SGR Treni', colors.red, 'train')} />
            <Stack.Screen name="NationalParks" component={PlaceholderScreen('Mbuga za Wanyama', colors.emerald, 'leaf')} />
            <Stack.Screen name="HotelSearch" component={PlaceholderScreen('Hoteli', colors.purple, 'bed')} />
            <Stack.Screen name="TransactionHistory" component={PlaceholderScreen('Historia ya Miamala', colors.blue, 'time')} />
            <Stack.Screen name="QRScanner" component={PlaceholderScreen('Skana QR', colors.purple, 'qr-code')} />
            <Stack.Screen name="Notifications" component={PlaceholderScreen('Arifa', colors.orange, 'notifications')} />
            <Stack.Screen name="EditProfile" component={PlaceholderScreen('Hariri Wasifu', colors.blue, 'person')} />
            <Stack.Screen name="Security" component={PlaceholderScreen('Usalama', colors.green, 'shield-checkmark')} />
            <Stack.Screen name="Insights" component={PlaceholderScreen('Uchunguzi wa Fedha', colors.cyan, 'analytics')} />
            <Stack.Screen name="BudgetTracker" component={PlaceholderScreen('Bajeti', colors.orange, 'pie-chart')} />
            <Stack.Screen name="GroupPools" component={PlaceholderScreen('Vikundi vya Pesa', colors.purple, 'people')} />
            <Stack.Screen name="MultiCurrency" component={PlaceholderScreen('Sarafu za Kigeni', colors.cyan, 'globe')} />
            <Stack.Screen name="GovernmentServices" component={PlaceholderScreen('Huduma za Serikali', colors.blue, 'business')} />
            <Stack.Screen name="Support" component={PlaceholderScreen('Msaada', colors.green, 'help-circle')} />
            <Stack.Screen name="WalletDetail" component={PlaceholderScreen('Kadi za Dijitali', colors.purple, 'card')} />
            <Stack.Screen name="BillPayments" component={PlaceholderScreen('Bili za Huduma', colors.orange, 'receipt')} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function PlaceholderScreen(title: string, accentColor: string, iconName: string) {
  return function Screen({ navigation }: any) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{
          paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20,
          flexDirection: 'row', alignItems: 'center', gap: 14,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          <Ionicons name="arrow-back" size={22} color={colors.white} onPress={() => navigation.goBack()} />
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ height: 3, width: 48, borderRadius: 2, backgroundColor: accentColor }} />
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>{title}</Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 }}>
          <View style={{
            width: 84, height: 84, borderRadius: 26,
            backgroundColor: `${accentColor}18`,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: `${accentColor}35`,
          }}>
            <Ionicons name={iconName as any} size={36} color={accentColor} />
          </View>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.white }}>{title}</Text>
            <Text style={{ fontSize: 14, color: colors.white40, textAlign: 'center', lineHeight: 20 }}>
              Kipengele hiki kinaendelezwa.{'\n'}Kitapatikana hivi karibuni.
            </Text>
          </View>
          <View style={{
            backgroundColor: `${accentColor}12`, borderRadius: 12,
            paddingHorizontal: 20, paddingVertical: 10,
            borderWidth: 1, borderColor: `${accentColor}25`,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: accentColor }}>Inakuja Hivi Karibuni</Text>
          </View>
        </View>
      </View>
    );
  };
}
