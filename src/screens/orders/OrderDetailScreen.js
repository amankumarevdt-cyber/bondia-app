import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

function InfoRow({ label, value, highlight }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.highlight]}>
        {value || '—'}
      </Text>
    </View>
  );
}

export default function OrderDetailScreen({ route }) {
  const order = route.params?.order || {};
  const items = order.items || order.order_items || [];

  const subtotal = parseFloat(order.subtotal || 0);
  const gstAmt = parseFloat(order.gst_amount || 0);
  const discAmt = parseFloat(order.discount_amount || 0);
  const total = parseFloat(order.total || 0);

  const fmtCurr = (n) =>
    `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderId}>Order #{order.id || order.order_id}</Text>
            {order.status ? (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.headerDate}>
            {order.created_at
              ? new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : order.date || ''}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Party Details</Text>
          <InfoRow label="Name" value={order.party?.name || order.party_name} />
          <InfoRow label="Mobile" value={order.party?.mobile || order.party_mobile} />
          <InfoRow label="GST" value={order.party?.gst_number} />
        </View>

        {items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({items.length})</Text>
            {items.map((item, idx) => {
              const itemName =
                item.item?.name || item.item_name || `Item ${idx + 1}`;
              const qty = item.qty || item.quantity || 0;
              const price = parseFloat(item.price || 0);
              const gst = parseFloat(item.gst || 0);
              const disc = parseFloat(item.discount || 0);
              const lineTotal =
                qty * price + (qty * price * gst) / 100 - (qty * price * disc) / 100;

              return (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName} numberOfLines={1}>{itemName}</Text>
                    <Text style={styles.itemMeta}>
                      {qty} × ₹{price.toFixed(2)}
                      {gst ? `  |  GST ${gst}%` : ''}
                      {disc ? `  |  Disc ${disc}%` : ''}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    {fmtCurr(lineTotal)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <InfoRow label="Subtotal" value={fmtCurr(subtotal)} />
          {gstAmt > 0 && <InfoRow label="GST Amount" value={fmtCurr(gstAmt)} />}
          {discAmt > 0 && <InfoRow label="Discount" value={`- ${fmtCurr(discAmt)}`} />}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>{fmtCurr(total)}</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerCard: {
    backgroundColor: colors.primary,
    padding: 20,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  orderId: { fontSize: 20, fontWeight: '800', color: colors.white },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: '700', color: colors.white },
  headerDate: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  highlight: { color: colors.primary, fontWeight: '700' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemLeft: { flex: 1, marginRight: 8 },
  itemName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  itemMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  itemTotal: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  totalValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
});
