import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';

function money(value) {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function InfoRow({ label, value, highlight }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.highlight]} numberOfLines={2}>
        {value || '-'}
      </Text>
    </View>
  );
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function OrderDetailScreen({ route }) {
  const order = route.params?.order || {};
  const items = order.items || order.order_items || [];
  const orderId = order.id || order.order_id || order.order_no || '-';
  const subtotal = Number(order.subtotal || 0);
  const gstAmt = Number(order.gst_amount || 0);
  const discAmt = Number(order.discount_amount || 0);
  const total = Number(order.total || order.grand_total || order.amount || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderId}>Order #{orderId}</Text>
            {order.status ? (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.headerDate}>
            {formatDate(order.created_at || order.date || order.order_date)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Party Details</Text>
          <InfoRow label="Name" value={order.party?.name || order.party_name || order.customer_name} />
          <InfoRow label="Mobile" value={order.party?.mobile || order.party_mobile || order.mobile} />
          <InfoRow label="GST" value={order.party?.gst_number || order.gst_number} />
        </View>

        {items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({items.length})</Text>
            {items.map((item, idx) => {
              const itemName =
                item.item?.name || item.item_name || item.name || `Item ${idx + 1}`;
              const qty = Number(item.qty || item.quantity || 0);
              const price = Number(item.price || item.rate || 0);
              const gst = Number(item.gst || item.gst_rate || 0);
              const disc = Number(item.discount || 0);
              const lineTotal =
                qty * price + (qty * price * gst) / 100 - (qty * price * disc) / 100;

              return (
                <View key={`${item.id || item.item_id || idx}`} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName} numberOfLines={1}>{itemName}</Text>
                    <Text style={styles.itemMeta}>
                      {qty} x Rs. {price.toFixed(2)}
                      {gst ? `  |  GST ${gst}%` : ''}
                      {disc ? `  |  Disc ${disc}%` : ''}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>{money(lineTotal)}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <InfoRow label="Subtotal" value={money(subtotal)} />
          {gstAmt > 0 && <InfoRow label="GST Amount" value={money(gstAmt)} />}
          {discAmt > 0 && <InfoRow label="Discount" value={`- ${money(discAmt)}`} />}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>{money(total)}</Text>
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
    borderRadius: 8,
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
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
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
