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
import { getItems, deleteItem } from '../../api/items';
import colors from '../../constants/colors';

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

function ItemCard({ item, onEdit, onDelete }) {
  const name = item.name || item.item_name || 'Unnamed Item';
  const hsn = item.hsn_code || item.hsn || '';
  const unit = item.unit || item.unit_name || '';
  const gst = item.gst || item.gst_rate || '';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onEdit(item)} activeOpacity={0.8}>
      <View style={styles.iconBox}>
        <Ionicons name="cube-outline" size={22} color="#EA580C" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.tagRow}>
          {hsn ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>HSN {hsn}</Text>
            </View>
          ) : null}
          {unit ? (
            <View style={[styles.tag, styles.unitTag]}>
              <Text style={[styles.tagText, styles.unitTagText]}>{unit}</Text>
            </View>
          ) : null}
          {gst ? (
            <View style={[styles.tag, styles.gstTag]}>
              <Text style={[styles.tagText, styles.gstTagText]}>{gst}% GST</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.trailing}>
        <Text style={styles.price}>{formatCurrency(item.price || item.rate)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(item)}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ItemListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadItems = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await getItems();
      setItems(normalizeList(res));
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load items.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadItems(); }, [loadItems]));

  const handleDelete = (item) => {
    const itemName = item.name || item.item_name || 'this item';
    Alert.alert('Delete Item', `Delete "${itemName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem(item.id);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete item.');
          }
        },
      },
    ]);
  };

  const query = search.trim().toLowerCase();
  const filtered = items.filter((i) => {
    const name = i.name || i.item_name || '';
    const hsn = i.hsn_code || i.hsn || '';
    return name.toLowerCase().includes(query) || String(hsn).includes(query);
  });

  if (loading) return <Loader message="Loading items..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or HSN code..."
        />
        <View style={styles.toolbar}>
          <Text style={styles.count}>{filtered.length} items</Text>
          <TouchableOpacity style={styles.addSmallBtn} onPress={() => navigation.navigate('ItemForm', { item: null })}>
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.addSmallText}>Add</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => String(item.id || item.hsn_code || index)}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onEdit={(i) => navigation.navigate('ItemForm', { item: i })}
              onDelete={handleDelete}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadItems(true); }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="cube-outline"
              iconColor="#EA580C"
              title="No Items Found"
              message={search ? 'No results match your search.' : 'Add products or services before creating orders.'}
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
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  addSmallText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 7 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: colors.primaryLight2,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  unitTag: { backgroundColor: colors.secondaryLight },
  unitTagText: { color: '#0E7490' },
  gstTag: { backgroundColor: colors.successLight },
  gstTagText: { color: '#065F46' },
  trailing: { alignItems: 'flex-end', marginLeft: 10 },
  price: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryLight2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: { backgroundColor: colors.dangerLight },
});
