import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PartyScreen from '../screens/party/PartyScreen';
import ItemsScreen from '../screens/items/ItemsScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import InvoicesScreen from '../screens/invoices/InvoicesScreen';
import { useAuth } from '../context/AuthContext';
import colors from '../styles/colors';

const Drawer = createDrawerNavigator();

const menuItems = [
  { name: 'Dashboard', icon: '🏠' },
  { name: 'Parties', icon: '🏢' },
  { name: 'Items', icon: '📦' },
  { name: 'Orders', icon: '🛒' },
  { name: 'Invoices', icon: '🧾' },
];

function CustomDrawerContent(props) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <View style={styles.headerLogoBox}>
          <Text style={styles.headerLogoText}>BE</Text>
        </View>
        <Text style={styles.headerCompany}>Bondia Enterprises</Text>
        <Text style={styles.headerTagline}>ERP System</Text>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{(user?.name || 'A').charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => {
        const menuItem = menuItems.find((m) => m.name === route.name);
        return {
          headerStyle: { backgroundColor: colors.primary, elevation: 0, shadowOpacity: 0 },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          drawerStyle: { backgroundColor: colors.drawerBg, width: 280 },
          drawerActiveTintColor: colors.white,
          drawerInactiveTintColor: 'rgba(255,255,255,0.65)',
          drawerActiveBackgroundColor: colors.drawerActive,
          drawerItemStyle: { borderRadius: 12, marginHorizontal: 8, marginVertical: 2 },
          drawerLabelStyle: { fontSize: 15, fontWeight: '600' },
          drawerIcon: ({ focused, color }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.7 }}>
              {menuItem?.icon || '📄'}
            </Text>
          ),
        };
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="Parties" component={PartyScreen} options={{ title: 'Parties' }} />
      <Drawer.Screen name="Items" component={ItemsScreen} options={{ title: 'Items' }} />
      <Drawer.Screen name="Orders" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Drawer.Screen name="Invoices" component={InvoicesScreen} options={{ title: 'Invoices' }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.drawerBg,
  },
  drawerHeader: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  headerLogoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerLogoText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
  },
  headerCompany: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.3,
  },
  headerTagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  userEmail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
  },
  scrollContent: {
    paddingTop: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 14,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B6B',
  },
});
