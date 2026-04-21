import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import colors from '../../styles/colors';

const stats = [
  { title: 'Parties', value: '48', icon: '🏢', color: colors.card1, screen: 'Parties' },
  { title: 'Items', value: '124', icon: '📦', color: colors.card2, screen: 'Items' },
  { title: 'Orders', value: '36', icon: '🛒', color: colors.card3, screen: 'Orders' },
  { title: 'Invoices', value: '21', icon: '🧾', color: colors.card4, screen: 'Invoices' },
];

const recentActivity = [
  { id: '1', label: 'New order from ABC Corp', time: '2 min ago', icon: '🛒' },
  { id: '2', label: 'Invoice #INV-0048 generated', time: '15 min ago', icon: '🧾' },
  { id: '3', label: 'New party: XYZ Ltd added', time: '1 hr ago', icon: '🏢' },
  { id: '4', label: 'Item: Steel Rods restocked', time: '3 hr ago', icon: '📦' },
];

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.userName}>{user?.name || 'Admin'} 👋</Text>
          <Text style={styles.date}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <View style={styles.summaryBanner}>
          <View style={styles.bannerItem}>
            <Text style={styles.bannerValue}>₹ 2.4L</Text>
            <Text style={styles.bannerLabel}>Today's Revenue</Text>
          </View>
          <View style={styles.bannerDivider} />
          <View style={styles.bannerItem}>
            <Text style={styles.bannerValue}>8</Text>
            <Text style={styles.bannerLabel}>Pending Orders</Text>
          </View>
          <View style={styles.bannerDivider} />
          <View style={styles.bannerItem}>
            <Text style={styles.bannerValue}>3</Text>
            <Text style={styles.bannerLabel}>Due Invoices</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.cardsGrid}>
          {stats.map((s) => (
            <StatCard
              key={s.title}
              title={s.title}
              value={s.value}
              icon={s.icon}
              color={s.color}
              onPress={() => navigation.navigate(s.screen)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {recentActivity.map((item) => (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>{item.icon}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityLabel}>{item.label}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  greetingSection: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  date: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
  },
  summaryBanner: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerItem: {
    flex: 1,
    alignItems: 'center',
  },
  bannerValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  bannerLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
    textAlign: 'center',
  },
  bannerDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  bottomSpace: {
    height: 32,
  },
});
