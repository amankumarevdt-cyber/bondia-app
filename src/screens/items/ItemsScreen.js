import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../styles/colors';

const mockItems = [
  { id: '1', name: 'Steel Rods (10mm)', category: 'Raw Material', stock: 240, unit: 'Pcs', price: '₹ 85/pc' },
  { id: '2', name: 'Cement OPC 53', category: 'Raw Material', stock: 80, unit: 'Bags', price: '₹ 390/bag' },
  { id: '3', name: 'PVC Pipe 4"', category: 'Plumbing', stock: 150, unit: 'Pcs', price: '₹ 220/pc' },
  { id: '4', name: 'Electrical Wire 2.5mm', category: 'Electrical', stock: 500, unit: 'Meters', price: '₹ 45/m' },
  { id: '5', name: 'Paint (White 20L)', category: 'Finishing', stock: 35, unit: 'Cans', price: '₹ 3,200/can' },
];

const ItemRow = ({ item }) => (
  <TouchableOpacity style={styles.item} activeOpacity={0.8}>
    <View style={styles.iconBox}>
      <Text style={styles.iconText}>📦</Text>
    </View>
    <View style={styles.info}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
    </View>
    <View style={styles.right}>
      <Text style={styles.price}>{item.price}</Text>
      <View style={[styles.stockBadge, { backgroundColor: item.stock > 100 ? '#E8F5E9' : '#FFF8E1' }]}>
        <Text style={[styles.stockText, { color: item.stock > 100 ? colors.card2 : colors.warning }]}>
          {item.stock} {item.unit}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ItemsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <FlatList
          data={mockItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ItemRow item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.count}>{mockItems.length} Items in Inventory</Text>}
        />
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>+ Add Item</Text>
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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 20 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  category: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  price: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  stockBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  stockText: { fontSize: 11, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    left: 20,
    backgroundColor: colors.card2,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.card2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
