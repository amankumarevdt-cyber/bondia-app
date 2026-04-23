import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import { getDashboard } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import colors from '../../constants/colors';

const CARD_CONFIG = [
  { key: 'parties', label: 'Parties', iconName: 'business-outline', color: colors.primary, screen: 'Parties' },
  { key: 'orders', label: 'Orders', iconName: 'cart-outline', color: '#0D9488', screen: 'Orders' },
  { key: 'item_group', label: 'Item Groups', iconName: 'cube-outline', color: '#EA580C', screen: 'Items' },
  { key: 'staffs', label: 'Staffs', iconName: 'people-outline', color: '#7C3AED', screen: null },
  { key: 'beats', label: 'Beats', iconName: 'location-outline', color: '#2563EB', screen: null },
  { key: 'roles', label: 'Roles', iconName: 'shield-checkmark-outline', color: '#0891B2', screen: null },
  { key: 'brands', label: 'Brands', iconName: 'star-outline', color: '#D97706', screen: null },
  { key: 'customer_types', label: 'Cust. Types', iconName: 'pricetag-outline', color: '#DB2777', screen: null },
  { key: 'area', label: 'Areas', iconName: 'map-outline', color: colors.secondary, screen: null },
  { key: 'industry', label: 'Industry', iconName: 'construct-outline', color: '#059669', screen: null },
  { key: 'company', label: 'Companies', iconName: 'storefront-outline', color: colors.danger, screen: null },
  { key: 'unit', label: 'Units', iconName: 'resize-outline', color: '#6366F1', screen: null },
];

function normalizeDashboardStats(response) {
  return response?.data?.data || response?.data || response || {};
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await getDashboard();
      setStats(normalizeDashboardStats(res));
    } catch (err) {
      if (!isRefresh) Alert.alert('Error', err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadDashboard(); }, [loadDashboard]));

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading && !refreshing) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadDashboard(true); }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.userName}>
            {user?.name || user?.mobile || 'Admin'}
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.bannerRow}>
          <View style={[styles.banner, { backgroundColor: colors.primary }]}>
            <Text style={styles.bannerVal}>{stats.parties ?? '-'}</Text>
            <Text style={styles.bannerLabel}>Parties</Text>
          </View>
          <View style={[styles.banner, { backgroundColor: '#0D9488' }]}>
            <Text style={styles.bannerVal}>{stats.orders ?? '-'}</Text>
            <Text style={styles.bannerLabel}>Orders</Text>
          </View>
          <View style={[styles.banner, { backgroundColor: '#7C3AED' }]}>
            <Text style={styles.bannerVal}>{stats.staffs ?? '-'}</Text>
            <Text style={styles.bannerLabel}>Staffs</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>All Modules</Text>

        <View style={styles.grid}>
          {CARD_CONFIG.map((card) => (
            <StatCard
              key={card.key}
              title={card.label}
              value={stats[card.key] ?? '0'}
              iconName={card.iconName}
              color={card.color}
              onPress={
                card.screen ? () => navigation.navigate(card.screen) : undefined
              }
            />
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, paddingHorizontal: 18 },
  greetingSection: { paddingTop: 16, paddingBottom: 20 },
  greeting: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  date: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  bannerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  banner: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerVal: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  bannerLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 3,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
