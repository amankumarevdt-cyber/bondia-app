import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function EmptyState({
  icon = null,
  iconName = 'file-tray-outline',
  iconColor = colors.primary,
  title = 'No Data',
  message,
}) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: `${iconColor}14` }]}>
        {icon ? (
          <Text style={styles.icon}>{icon}</Text>
        ) : (
          <Ionicons name={iconName} size={30} color={iconColor} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  icon: { fontSize: 30 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
