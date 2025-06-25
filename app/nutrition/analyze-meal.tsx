// app/nutrition/analyze-meal.tsx
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AnalyzeMealScreen() {
  const { mealId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    // TODO: replace this timer with real polling for GPT / Supabase once backend is ready
    const timer = setTimeout(() => {
      router.replace({
        pathname: '/nutrition/confirm-meal',
        params: { mealId },
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [mealId, router]);

  return (
    <View style={styles.container}>
      {/* Optional: show your app logo while waiting */}
      {/**
      <Image
        source={require('../../assets/logo.png')} // update path if logo lives elsewhere
        style={styles.logo}
        resizeMode="contain"
      />
      **/}

      <ActivityIndicator size="large" color="#000" />
      <Text style={styles.text}>Analyzing your meal…</Text>

      {/* Simple animated ellipsis/shimmer placeholder */}
      <Text style={styles.subtext}>Crunching macros and feedback</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 32,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#777',
  },
});