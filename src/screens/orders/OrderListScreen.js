import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { getOrders } from '../../api/orders';
import colors from '../../constants/colors';

const STATUS_COLORS = {
  pending: { bg: colors.warningLight, text: '#92400E' },
  confirmed: { bg: colors.primaryLight2, text: colors.primaryDark },
  delivered: { bg: colors.successLight, text: '#065F46' },
  cancelled: { bg: colors.dangerLight, text: '#991B1B' },
  default: { bg: '#F1F5F9', text: colors.textSecondary },
};

function OrderCard({ item, onPress }) {
  const statusKey = item.status?.toLowerCase() || 'default';
  const sc = STATUS_COLORS[statusKey] || STATUS_COLORS.default;
  const total = item.total
    ? `₹ ${parseFloat(item.total).toLocaleString('en-IN')}`
    : '—';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <Text style={styles.orderId}>#{item.id || item.order_id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>
            {item.status || 'Pending'}
          </Text>
        </View>
      </View>
      {item.party?.name || item.party_name ? (
        <Text style={styles.partyName}>
          {item.party?.name || item.party_name}
        </Text>
      ) : null}
      <View style={styles.cardBottom}>
        <Text style={styles.date}>
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : item.date || '—'}
        </Text>
        <Text style={styles.total}>{total}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function OrderListScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await getOrders();
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setOrders(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadOrders(); }, [loadOrders]));

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      String(o.id || o.order_id).includes(q) ||
      (o.party?.name || o.party_name || '').toLowerCase().includes(q)
    );
  });

  if (loading) return <Loader message="Loading orders..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by order ID or party name..."
        />
        <Text style={styles.count}>{filtered.length} orders</Text>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id || item.order_id)}
          renderItem={({ item }) => (
            <OrderCard
              item={item}
              onPress={(o) => navigation.navigate('OrderDetail', { order: o })}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadOrders(true); }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🛒"
              title="No Orders Found"
              message={
                search
                  ? 'No results match your search.'
                  : 'Create your first order using the button below.'
              }
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('OrderCreate')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color={colors.white} />
          <Text style={styles.fabText}>New Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  count: { fontSize: 12, color: colors.textLight, marginBottom: 8, fontWeight: '500' },
  list: { paddingBottom: 90 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: { fontSize: 14, fontWeight: '800', color: colors.primary },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  partyName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    alignItems: 'center',
  },
  date: { fontSize: 12, color: colors.textSecondary },
  total: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    left: 16,
    backgroundColor: '#0D9488',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
