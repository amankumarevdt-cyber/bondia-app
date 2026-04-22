import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import colors from '../constants/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>BE</Text>
      </View>
      <Text style={styles.appName}>Bondia Enterprises</Text>
      <Text style={styles.tagline}>ERP Management System</Text>
      <ActivityIndicator
        size="small"
        color="rgba(255,255,255,0.7)"
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: { fontSize: 36, fontWeight: '900', color: colors.white },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 6,
  },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 48 },
  spinner: { position: 'absolute', bottom: 56 },
});
