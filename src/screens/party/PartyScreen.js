import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../styles/colors';

const mockParties = [
  { id: '1', name: 'ABC Corporation', type: 'Customer', phone: '9876543210', balance: '₹ 45,000' },
  { id: '2', name: 'XYZ Suppliers', type: 'Supplier', phone: '9123456789', balance: '₹ 1,20,000' },
  { id: '3', name: 'Global Traders', type: 'Customer', phone: '9988776655', balance: '₹ 78,500' },
  { id: '4', name: 'Pioneer Industries', type: 'Supplier', phone: '9001122334', balance: '₹ 33,000' },
  { id: '5', name: 'Sunrise Exports', type: 'Customer', phone: '8877665544', balance: '₹ 2,05,000' },
];

const PartyItem = ({ item }) => (
  <TouchableOpacity style={styles.item} activeOpacity={0.8}>
    <View style={[styles.avatar, { backgroundColor: item.type === 'Customer' ? colors.card1 : colors.card2 }]}>
      <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
    </View>
    <View style={styles.info}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.phone}>{item.phone}</Text>
    </View>
    <View style={styles.right}>
      <View style={[styles.badge, { backgroundColor: item.type === 'Customer' ? '#E3F2FD' : '#E8F5E9' }]}>
        <Text style={[styles.badgeText, { color: item.type === 'Customer' ? colors.card1 : colors.card2 }]}>
          {item.type}
        </Text>
      </View>
      <Text style={styles.balance}>{item.balance}</Text>
    </View>
  </TouchableOpacity>
);

export default function PartyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <FlatList
          data={mockParties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PartyItem item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.count}>{mockParties.length} Parties</Text>
          }
        />
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>+ Add Party</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.white },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  phone: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  balance: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    left: 20,
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
