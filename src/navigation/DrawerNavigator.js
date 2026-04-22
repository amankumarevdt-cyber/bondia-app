import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PartyListScreen from '../screens/parties/PartyListScreen';
import PartyFormScreen from '../screens/parties/PartyFormScreen';
import ItemListScreen from '../screens/items/ItemListScreen';
import ItemFormScreen from '../screens/items/ItemFormScreen';
import OrderListScreen from '../screens/orders/OrderListScreen';
import OrderCreateScreen from '../screens/orders/OrderCreateScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';

import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

const Drawer = createDrawerNavigator();
const PartiesStack = createStackNavigator();
const ItemsStack = createStackNavigator();
const OrdersStack = createStackNavigator();

const sharedHeader = {
  headerStyle: {
    backgroundColor: colors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700', fontSize: 17 },
  headerBackTitleVisible: false,
};

function menuHeaderLeft(navigation) {
  return (
    <TouchableOpacity
      style={{ paddingHorizontal: 16 }}
      onPress={() => navigation.getParent()?.openDrawer()}
    >
      <Ionicons name="menu" size={24} color={colors.white} />
    </TouchableOpacity>
  );
}

function PartiesNavigator() {
  return (
    <PartiesStack.Navigator screenOptions={sharedHeader}>
      <PartiesStack.Screen
        name="PartyList"
        component={PartyListScreen}
        options={({ navigation }) => ({
          title: 'Parties',
          headerLeft: () => menuHeaderLeft(navigation),
        })}
      />
      <PartiesStack.Screen
        name="PartyForm"
        component={PartyFormScreen}
        options={({ route }) => ({
          title: route.params?.party ? 'Edit Party' : 'Add Party',
        })}
      />
    </PartiesStack.Navigator>
  );
}

function ItemsNavigator() {
  return (
    <ItemsStack.Navigator screenOptions={sharedHeader}>
      <ItemsStack.Screen
        name="ItemList"
        component={ItemListScreen}
        options={({ navigation }) => ({
          title: 'Items',
          headerLeft: () => menuHeaderLeft(navigation),
        })}
      />
      <ItemsStack.Screen
        name="ItemForm"
        component={ItemFormScreen}
        options={({ route }) => ({
          title: route.params?.item ? 'Edit Item' : 'Add Item',
        })}
      />
    </ItemsStack.Navigator>
  );
}

function OrdersNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={sharedHeader}>
      <OrdersStack.Screen
        name="OrderList"
        component={OrderListScreen}
        options={({ navigation }) => ({
          title: 'Orders',
          headerLeft: () => menuHeaderLeft(navigation),
        })}
      />
      <OrdersStack.Screen
        name="OrderCreate"
        component={OrderCreateScreen}
        options={{ title: 'New Order' }}
      />
      <OrdersStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
    </OrdersStack.Navigator>
  );
}

function CustomDrawerContent(props) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const initial = (user?.name || user?.mobile || 'A')
    .charAt(0)
    .toUpperCase();

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>BE</Text>
        </View>
        <Text style={styles.company}>Bondia Enterprises</Text>
        <Text style={styles.tagline}>ERP Management System</Text>
        <View style={styles.userBox}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Admin'}
            </Text>
            <Text style={styles.userSub} numberOfLines={1}>
              {user?.mobile || user?.email || ''}
            </Text>
          </View>
        </View>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.menuContent}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const MENU = [
  { name: 'Dashboard', icon: 'grid-outline' },
  { name: 'Parties', icon: 'business-outline' },
  { name: 'Items', icon: 'cube-outline' },
  { name: 'Orders', icon: 'cart-outline' },
];

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => {
        const menu = MENU.find((m) => m.name === route.name);
        return {
          headerShown: false,
          drawerStyle: { backgroundColor: colors.drawer, width: 285 },
          drawerActiveTintColor: colors.white,
          drawerInactiveTintColor: 'rgba(255,255,255,0.58)',
          drawerActiveBackgroundColor: colors.drawerActive,
          drawerItemStyle: {
            borderRadius: 12,
            marginHorizontal: 8,
            marginVertical: 2,
          },
          drawerLabelStyle: { fontSize: 15, fontWeight: '600', marginLeft: -8 },
          drawerIcon: ({ color }) => (
            <Ionicons
              name={menu?.icon || 'document-outline'}
              size={20}
              color={color}
            />
          ),
        };
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: true,
          ...{
            headerStyle: { backgroundColor: colors.primary, elevation: 0, shadowOpacity: 0 },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          },
          title: 'Dashboard',
        }}
      />
      <Drawer.Screen name="Parties" component={PartiesNavigator} />
      <Drawer.Screen name="Items" component={ItemsNavigator} />
      <Drawer.Screen name="Orders" component={OrdersNavigator} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: { flex: 1, backgroundColor: colors.drawer },
  drawerHeader: {
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: { fontSize: 20, fontWeight: '900', color: colors.white },
  company: { fontSize: 16, fontWeight: '800', color: colors.white },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.58)', marginBottom: 16 },
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: { fontSize: 16, fontWeight: '700', color: colors.white },
  userName: { fontSize: 14, fontWeight: '700', color: colors.white },
  userSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  menuContent: { paddingTop: 10 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    padding: 14,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#FF6B6B' },
});
