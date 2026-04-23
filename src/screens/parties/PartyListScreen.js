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

function normalizeList(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function PartyCard({ item, onEdit, onDelete }) {
  const name = item.name || item.party_name || 'Unnamed Party';
  const mobile = item.mobile || item.phone || item.contact_number || '-';
  const email = item.email || '';
  const state = item.state || item.state_name || '';

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="call-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.mobile} numberOfLines={1}>{mobile}</Text>
        </View>
        {email ? (
          <View style={styles.metaRow}>
            <Ionicons name="mail-outline" size={13} color={colors.textLight} />
            <Text style={styles.sub} numberOfLines={1}>{email}</Text>
          </View>
        ) : null}
        {state ? (
          <View style={styles.stateBadge}>
            <Text style={styles.stateText}>{state}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={19} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, styles.deleteIconBtn]} onPress={() => onDelete(item)}>
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
      setParties(normalizeList(res));
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load parties.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadParties(); }, [loadParties]));

  const handleDelete = (party) => {
    const partyName = party.name || party.party_name || 'this party';
    Alert.alert(
      'Delete Party',
      `Delete "${partyName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteParty(party.id);
              setParties((prev) => prev.filter((p) => p.id !== party.id));
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete party.');
            }
          },
        },
      ],
    );
  };

  const query = search.trim().toLowerCase();
  const filtered = parties.filter((p) => {
    const name = p.name || p.party_name || '';
    const mobile = p.mobile || p.phone || p.contact_number || '';
    const email = p.email || '';
    return (
      name.toLowerCase().includes(query) ||
      String(mobile).includes(query) ||
      email.toLowerCase().includes(query)
    );
  });

  if (loading) return <Loader message="Loading parties..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, mobile or email..."
        />
        <View style={styles.toolbar}>
          <Text style={styles.count}>
            {filtered.length} {filtered.length === 1 ? 'party' : 'parties'}
          </Text>
          <TouchableOpacity style={styles.addSmallBtn} onPress={() => navigation.navigate('PartyForm', { party: null })}>
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.addSmallText}>Add</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => String(item.id || item.mobile || index)}
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
              iconName="business-outline"
              iconColor={colors.primary}
              title="No Parties Found"
              message={search ? 'No results match your search.' : 'Add your first party to start taking orders.'}
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
    backgroundColor: colors.primary,
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
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: colors.primaryLight2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarText: { fontSize: 19, fontWeight: '800', color: colors.primary },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  mobile: { flex: 1, fontSize: 13, color: colors.textSecondary },
  sub: { flex: 1, fontSize: 12, color: colors.textLight },
  stateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight2,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 7,
  },
  stateText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  actions: { flexDirection: 'row', gap: 8, marginLeft: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primaryLight2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconBtn: { backgroundColor: colors.dangerLight },
});
