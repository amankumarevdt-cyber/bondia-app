import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function StatCard({ title, value, icon, iconName, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: color || colors.primary }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.82 : 1}
    >
      <View style={styles.iconBox}>
        {iconName ? (
          <Ionicons name={iconName} size={21} color={colors.white} />
        ) : (
          <Text style={styles.icon}>{icon}</Text>
        )}
      </View>
      <Text style={styles.value}>{value ?? '-'}</Text>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: { fontSize: 20 },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
});
