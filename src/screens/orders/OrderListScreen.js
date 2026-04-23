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
  completed: { bg: colors.successLight, text: '#065F46' },
  cancelled: { bg: colors.dangerLight, text: '#991B1B' },
  default: { bg: '#F1F5F9', text: colors.textSecondary },
};

function normalizeList(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return '-';
  return `Rs. ${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function OrderCard({ item, onPress }) {
  const id = item.id || item.order_id || item.order_no || '-';
  const status = item.status || 'Pending';
  const statusKey = status.toLowerCase();
  const sc = STATUS_COLORS[statusKey] || STATUS_COLORS.default;
  const partyName = item.party?.name || item.party_name || item.customer_name || 'Walk-in Party';
  const total = item.total || item.grand_total || item.amount;
  const date = item.created_at || item.date || item.order_date;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={styles.orderIdWrap}>
          <Ionicons name="receipt-outline" size={17} color={colors.primary} />
          <Text style={styles.orderId}>#{id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]} numberOfLines={1}>
            {status}
          </Text>
        </View>
      </View>
      <Text style={styles.partyName} numberOfLines={1}>{partyName}</Text>
      <View style={styles.cardBottom}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textLight} />
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
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
      setOrders(normalizeList(res));
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadOrders(); }, [loadOrders]));

  const query = search.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    const id = o.id || o.order_id || o.order_no || '';
    const party = o.party?.name || o.party_name || o.customer_name || '';
    const status = o.status || '';
    return (
      String(id).toLowerCase().includes(query) ||
      party.toLowerCase().includes(query) ||
      status.toLowerCase().includes(query)
    );
  });

  if (loading) return <Loader message="Loading orders..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by order ID, party or status..."
        />
        <View style={styles.toolbar}>
          <Text style={styles.count}>{filtered.length} orders</Text>
          <TouchableOpacity style={styles.addSmallBtn} onPress={() => navigation.navigate('OrderCreate')}>
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.addSmallText}>New</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => String(item.id || item.order_id || index)}
          renderItem={({ item }) => (
            <OrderCard
              item={item}
              onPress={(o) => navigation.navigate('OrderDetail', { order: o, id: o.id || o.order_id })}
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
              iconName="cart-outline"
              iconColor="#0D9488"
              title="No Orders Found"
              message={search ? 'No results match your search.' : 'Create your first order from parties and items.'}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  count: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  addSmallBtn: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D9488',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  addSmallText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
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
    marginBottom: 8,
    gap: 10,
  },
  orderIdWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  orderId: { fontSize: 14, fontWeight: '800', color: colors.primary },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 130,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  partyName: {
    fontSize: 15,
    fontWeight: '700',
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
    gap: 8,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  date: { fontSize: 12, color: colors.textSecondary },
  total: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
});
