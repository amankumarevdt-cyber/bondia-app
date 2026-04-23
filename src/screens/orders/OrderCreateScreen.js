import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { getParties } from '../../api/parties';
import { getItems } from '../../api/items';
import { createOrder } from '../../api/orders';
import colors from '../../constants/colors';

function normalizeList(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function money(value) {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function PickerModal({ visible, title, data, type, onSelect, onClose, searchPlaceholder }) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const filtered = data.filter((d) => {
    const name = d.name || d.party_name || d.item_name || '';
    const mobile = d.mobile || d.phone || '';
    const hsn = d.hsn_code || d.hsn || '';
    return (
      name.toLowerCase().includes(query) ||
      String(mobile).includes(query) ||
      String(hsn).includes(query)
    );
  });

  const close = () => {
    setSearch('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{title}</Text>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={close}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={searchPlaceholder || 'Search...'}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item, index) => String(item.id || item.mobile || item.hsn_code || index)}
            renderItem={({ item }) => {
              const name = item.name || item.party_name || item.item_name || 'Unnamed';
              const sub = type === 'party'
                ? (item.mobile || item.phone || item.email || '')
                : [
                    item.hsn_code || item.hsn ? `HSN ${item.hsn_code || item.hsn}` : null,
                    item.price != null || item.rate != null ? money(item.price ?? item.rate) : null,
                  ].filter(Boolean).join('  |  ');

              return (
                <TouchableOpacity
                  style={modalStyles.item}
                  onPress={() => { onSelect(item); close(); }}
                  activeOpacity={0.7}
                >
                  <View style={modalStyles.itemIcon}>
                    <Ionicons
                      name={type === 'party' ? 'business-outline' : 'cube-outline'}
                      size={20}
                      color={type === 'party' ? colors.primary : '#EA580C'}
                    />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={modalStyles.itemName} numberOfLines={1}>{name}</Text>
                    {sub ? <Text style={modalStyles.itemSub} numberOfLines={1}>{sub}</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <EmptyState
                iconName={type === 'party' ? 'business-outline' : 'cube-outline'}
                iconColor={type === 'party' ? colors.primary : '#EA580C'}
                title="No Results"
                message="Try another search term."
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
}

function numberValue(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function OrderItemRow({ orderItem, index, onChange, onRemove }) {
  const { item, qty, price, gst, discount } = orderItem;
  const itemName = item.name || item.item_name || 'Unnamed Item';
  const lineBase = numberValue(qty) * numberValue(price);
  const lineGst = lineBase * (numberValue(gst) / 100);
  const lineDisc = lineBase * (numberValue(discount) / 100);
  const lineTotal = lineBase + lineGst - lineDisc;

  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.header}>
        <Text style={rowStyles.itemName} numberOfLines={1}>{itemName}</Text>
        <TouchableOpacity style={rowStyles.removeBtn} onPress={() => onRemove(index)}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
      <View style={rowStyles.fields}>
        <View style={rowStyles.field}>
          <Text style={rowStyles.fieldLabel}>Qty</Text>
          <TextInput
            style={rowStyles.fieldInput}
            value={qty}
            onChangeText={(v) => onChange(index, 'qty', v)}
            keyboardType="decimal-pad"
            placeholder="1"
          />
        </View>
        <View style={rowStyles.field}>
          <Text style={rowStyles.fieldLabel}>Price</Text>
          <TextInput
            style={rowStyles.fieldInput}
            value={price}
            onChangeText={(v) => onChange(index, 'price', v)}
            keyboardType="decimal-pad"
            placeholder="0"
          />
        </View>
        <View style={rowStyles.field}>
          <Text style={rowStyles.fieldLabel}>GST %</Text>
          <TextInput
            style={rowStyles.fieldInput}
            value={gst}
            onChangeText={(v) => onChange(index, 'gst', v)}
            keyboardType="decimal-pad"
            placeholder="0"
          />
        </View>
        <View style={rowStyles.field}>
          <Text style={rowStyles.fieldLabel}>Disc %</Text>
          <TextInput
            style={rowStyles.fieldInput}
            value={discount}
            onChangeText={(v) => onChange(index, 'discount', v)}
            keyboardType="decimal-pad"
            placeholder="0"
          />
        </View>
      </View>
      <View style={rowStyles.footer}>
        <Text style={rowStyles.lineLabel}>Line Total</Text>
        <Text style={rowStyles.lineTotal}>{money(lineTotal)}</Text>
      </View>
    </View>
  );
}

export default function OrderCreateScreen({ navigation }) {
  const [parties, setParties] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedParty, setSelectedParty] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [partyModalVisible, setPartyModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, iRes] = await Promise.all([getParties(), getItems()]);
        setParties(normalizeList(pRes));
        setItemsList(normalizeList(iRes));
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load parties and items.');
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const handleItemChange = (index, key, value) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleAddItem = (item) => {
    const existing = orderItems.findIndex((oi) => oi.item.id === item.id);
    if (existing >= 0) {
      Alert.alert('Already Added', `"${item.name || item.item_name}" is already in the order.`);
      return;
    }
    setOrderItems((prev) => [
      ...prev,
      {
        item,
        qty: '1',
        price: item.price != null || item.rate != null ? String(item.price ?? item.rate) : '0',
        gst: item.gst != null || item.gst_rate != null ? String(item.gst ?? item.gst_rate) : '0',
        discount: '0',
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = orderItems.reduce((sum, oi) => sum + numberValue(oi.qty) * numberValue(oi.price), 0);
  const gstAmount = orderItems.reduce((sum, oi) => {
    const base = numberValue(oi.qty) * numberValue(oi.price);
    return sum + base * (numberValue(oi.gst) / 100);
  }, 0);
  const discountAmount = orderItems.reduce((sum, oi) => {
    const base = numberValue(oi.qty) * numberValue(oi.price);
    return sum + base * (numberValue(oi.discount) / 100);
  }, 0);
  const grandTotal = subtotal + gstAmount - discountAmount;

  const handleSubmit = async () => {
    if (!selectedParty) {
      Alert.alert('Validation', 'Please select a party.');
      return;
    }
    if (orderItems.length === 0) {
      Alert.alert('Validation', 'Please add at least one item.');
      return;
    }
    if (orderItems.some((oi) => numberValue(oi.qty) <= 0)) {
      Alert.alert('Validation', 'Please enter a valid quantity for all items.');
      return;
    }

    setSubmitting(true);
    const payload = {
      party_id: selectedParty.id,
      items: orderItems.map((oi) => ({
        item_id: oi.item.id,
        qty: numberValue(oi.qty),
        price: numberValue(oi.price),
        gst: numberValue(oi.gst),
        discount: numberValue(oi.discount),
      })),
      subtotal: subtotal.toFixed(2),
      gst_amount: gstAmount.toFixed(2),
      discount_amount: discountAmount.toFixed(2),
      total: grandTotal.toFixed(2),
    };

    try {
      await createOrder(payload);
      Alert.alert('Order Placed', 'The order has been created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (dataLoading) return <Loader message="Loading data..." />;

  const selectedPartyName = selectedParty?.name || selectedParty?.party_name;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>Party</Text>
          <TouchableOpacity
            style={[styles.selectorBtn, selectedParty && styles.selectorBtnActive]}
            onPress={() => setPartyModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business-outline"
              size={20}
              color={selectedParty ? colors.primary : colors.textLight}
            />
            <Text
              style={[styles.selectorText, selectedParty && styles.selectorTextActive]}
              numberOfLines={1}
            >
              {selectedPartyName || 'Select a party'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={selectedParty ? colors.primary : colors.textLight} />
          </TouchableOpacity>
          {selectedParty?.mobile ? (
            <Text style={styles.partyMeta}>{selectedParty.mobile}</Text>
          ) : null}

          <View style={styles.itemsHeader}>
            <Text style={styles.sectionLabel}>Items</Text>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={() => setItemModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {orderItems.length === 0 ? (
            <View style={styles.emptyItems}>
              <Ionicons name="cube-outline" size={32} color={colors.textLight} />
              <Text style={styles.emptyItemsText}>No items added yet</Text>
            </View>
          ) : (
            orderItems.map((oi, idx) => (
              <OrderItemRow
                key={oi.item.id || idx}
                orderItem={oi}
                index={idx}
                onChange={handleItemChange}
                onRemove={handleRemoveItem}
              />
            ))
          )}

          {orderItems.length > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{money(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>GST Amount</Text>
                <Text style={styles.summaryValue}>+ {money(gstAmount)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  - {money(discountAmount)}
                </Text>
              </View>
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>Grand Total</Text>
                <Text style={styles.grandValue}>{money(grandTotal)}</Text>
              </View>
            </View>
          )}

          <CustomButton
            title="Place Order"
            onPress={handleSubmit}
            loading={submitting}
            variant="success"
            style={{ marginTop: 16 }}
          />
          <CustomButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="ghost"
            style={{ marginTop: 10, marginBottom: 40 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        visible={partyModalVisible}
        title="Select Party"
        type="party"
        data={parties}
        onSelect={setSelectedParty}
        onClose={() => setPartyModalVisible(false)}
        searchPlaceholder="Search parties..."
      />
      <PickerModal
        visible={itemModalVisible}
        title="Select Item"
        type="item"
        data={itemsList}
        onSelect={handleAddItem}
        onClose={() => setItemModalVisible(false)}
        searchPlaceholder="Search items..."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 6,
  },
  selectorBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight2,
  },
  selectorText: { flex: 1, fontSize: 15, color: colors.textLight },
  selectorTextActive: { color: colors.primary, fontWeight: '600' },
  partyMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    marginLeft: 4,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight2,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addItemText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  emptyItems: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 32,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyItemsText: { fontSize: 14, color: colors.textLight, marginTop: 8 },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
  },
  grandLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  grandValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  itemSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

const rowStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerLight,
  },
  fields: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  field: { flex: 1 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lineLabel: { fontSize: 12, color: colors.textSecondary },
  lineTotal: { fontSize: 15, fontWeight: '800', color: colors.primary },
});
