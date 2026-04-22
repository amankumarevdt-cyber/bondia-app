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
import { getParties, deleteParty } from '../../api/parties';
import colors from '../../constants/colors';

function PartyCard({ item, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.mobile}>{item.mobile}</Text>
          {item.email ? (
            <Text style={styles.sub} numberOfLines={1}>{item.email}</Text>
          ) : null}
          {item.state ? (
            <View style={styles.stateBadge}>
              <Text style={styles.stateText}>{item.state}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={19} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item)}>
          <Ionicons name="trash-outline" size={19} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PartyListScreen({ navigation }) {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadParties = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await getParties();
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setParties(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load parties. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadParties(); }, [loadParties]));

  const handleDelete = (party) => {
    Alert.alert(
      'Delete Party',
      `Delete "${party.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteParty(party.id);
              setParties((prev) => prev.filter((p) => p.id !== party.id));
            } catch (_) {
              Alert.alert('Error', 'Failed to delete party.');
            }
          },
        },
      ],
    );
  };

  const filtered = parties.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.mobile?.includes(search) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <Loader message="Loading parties..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, mobile or email..."
        />
        <Text style={styles.count}>
          {filtered.length} {filtered.length === 1 ? 'party' : 'parties'}
        </Text>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PartyCard
              item={item}
              onEdit={(p) => navigation.navigate('PartyForm', { party: p })}
              onDelete={handleDelete}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadParties(true); }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🏢"
              title="No Parties Found"
              message={
                search
                  ? 'No results match your search.'
                  : 'Add your first party using the button below.'
              }
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('PartyForm', { party: null })}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color={colors.white} />
          <Text style={styles.fabText}>Add Party</Text>
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
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: colors.primaryLight2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarText: { fontSize: 19, fontWeight: '800', color: colors.primary },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  mobile: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sub: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  stateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight2,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 5,
  },
  stateText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  actions: { flexDirection: 'row', gap: 8, marginLeft: 10 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    left: 16,
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
