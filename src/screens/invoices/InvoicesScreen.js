import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../styles/colors';

const mockInvoices = [
  { id: '1', invId: 'INV-0048', party: 'ABC Corporation', date: '21 Apr 2024', due: '30 Apr 2024', amount: '₹ 48,000', status: 'Unpaid' },
  { id: '2', invId: 'INV-0047', party: 'Sunrise Exports', date: '18 Apr 2024', due: '28 Apr 2024', amount: '₹ 1,20,000', status: 'Paid' },
  { id: '3', invId: 'INV-0046', party: 'Global Traders', date: '15 Apr 2024', due: '25 Apr 2024', amount: '₹ 32,500', status: 'Overdue' },
  { id: '4', invId: 'INV-0045', party: 'Pioneer Industries', date: '10 Apr 2024', due: '20 Apr 2024', amount: '₹ 88,200', status: 'Paid' },
];

const statusColors = {
  Unpaid: { bg: '#FFF8E1', text: '#F59E0B' },
  Paid: { bg: '#E8F5E9', text: '#00897B' },
  Overdue: { bg: '#FFEBEE', text: '#EF4444' },
};

const InvoiceRow = ({ item }) => {
  const sc = statusColors[item.status] || statusColors.Unpaid;
  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.8}>
      <View style={styles.topRow}>
        <Text style={styles.invId}>{item.invId}</Text>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.party}>{item.party}</Text>
      <View style={styles.datesRow}>
        <Text style={styles.dateLabel}>Issued: <Text style={styles.dateValue}>{item.date}</Text></Text>
        <Text style={styles.dateLabel}>Due: <Text style={[styles.dateValue, item.status === 'Overdue' && { color: colors.error }]}>{item.due}</Text></Text>
      </View>
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={styles.amount}>{item.amount}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function InvoicesScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <FlatList
          data={mockInvoices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <InvoiceRow item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.count}>{mockInvoices.length} Invoices</Text>}
        />
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>+ New Invoice</Text>
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
  invId: { fontSize: 14, fontWeight: '800', color: colors.card4 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  party: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dateLabel: { fontSize: 12, color: colors.textSecondary },
  dateValue: { fontWeight: '600', color: colors.textPrimary },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  amountLabel: { fontSize: 12, color: colors.textSecondary },
  amount: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    left: 20,
    backgroundColor: colors.card4,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.card4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
