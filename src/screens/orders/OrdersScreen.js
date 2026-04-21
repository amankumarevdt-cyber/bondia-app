import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../styles/colors';

const mockOrders = [
  { id: '1', orderId: 'ORD-0036', party: 'ABC Corporation', date: '21 Apr 2024', amount: '₹ 48,000', status: 'Pending' },
  { id: '2', orderId: 'ORD-0035', party: 'Sunrise Exports', date: '20 Apr 2024', amount: '₹ 1,20,000', status: 'Confirmed' },
  { id: '3', orderId: 'ORD-0034', party: 'Global Traders', date: '19 Apr 2024', amount: '₹ 32,500', status: 'Delivered' },
  { id: '4', orderId: 'ORD-0033', party: 'XYZ Suppliers', date: '18 Apr 2024', amount: '₹ 75,000', status: 'Cancelled' },
  { id: '5', orderId: 'ORD-0032', party: 'Pioneer Industries', date: '17 Apr 2024', amount: '₹ 88,200', status: 'Confirmed' },
];

const statusColors = {
  Pending: { bg: '#FFF8E1', text: '#F59E0B' },
  Confirmed: { bg: '#E3F2FD', text: '#1565C0' },
  Delivered: { bg: '#E8F5E9', text: '#00897B' },
  Cancelled: { bg: '#FFEBEE', text: '#EF4444' },
};

const OrderRow = ({ item }) => {
  const sc = statusColors[item.status] || statusColors.Pending;
  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.8}>
      <View style={styles.topRow}>
        <Text style={styles.orderId}>{item.orderId}</Text>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.party}>{item.party}</Text>
      <View style={styles.bottomRow}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.amount}>{item.amount}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <FlatList
          data={mockOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderRow item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.count}>{mockOrders.length} Orders</Text>}
        />
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>+ New Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  list: { padding: 20, paddingBottom: 100 },
  count: { fontSize: 13, color: colors.textSecondary, marginBottom: 12, fontWeight: '500' },
  item: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 14, fontWeight: '800', color: colors.primary },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  party: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  date: { fontSize: 12, color: colors.textSecondary },
  amount: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    left: 20,
    backgroundColor: colors.card3,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.card3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
