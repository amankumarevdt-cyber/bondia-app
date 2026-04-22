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
import { getItems } from '../../api/items';
import colors from '../../constants/colors';

function ItemCard({ item, onEdit }) {
  const price = item.price ? `₹ ${parseFloat(item.price).toLocaleString('en-IN')}` : '—';
  const gst = item.gst ? `${item.gst}% GST` : null;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onEdit(item)} activeOpacity={0.8}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>📦</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <View style={styles.tagRow}>
          {item.hsn_code ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>HSN: {item.hsn_code}</Text>
            </View>
          ) : null}
          {item.unit ? (
            <View style={[styles.tag, { backgroundColor: colors.secondaryLight }]}>
              <Text style={[styles.tagText, { color: '#0E7490' }]}>{item.unit}</Text>
            </View>
          ) : null}
          {gst ? (
            <View style={[styles.tag, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.tagText, { color: '#065F46' }]}>{gst}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.priceBox}>
        <Text style={styles.price}>{price}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
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
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setItems(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load items.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadItems(); }, [loadItems]));

  const filtered = items.filter(
    (i) =>
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.hsn_code?.includes(search),
  );

  if (loading) return <Loader message="Loading items..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or HSN code..."
        />
        <Text style={styles.count}>{filtered.length} items</Text>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onEdit={(i) => navigation.navigate('ItemForm', { item: i })}
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
              icon="📦"
              title="No Items Found"
              message={
                search
                  ? 'No results match your search.'
                  : 'Add your first item using the button below.'
              }
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('ItemForm', { item: null })}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color={colors.white} />
          <Text style={styles.fabText}>Add Item</Text>
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
    borderRadius: 13,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  iconText: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: colors.primaryLight2,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  priceBox: { alignItems: 'flex-end', marginLeft: 8 },
  price: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    left: 16,
    backgroundColor: '#EA580C',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
