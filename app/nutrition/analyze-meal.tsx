// app/nutrition/analyze-meal.tsx
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AnalyzeMealScreen() {
  const { mealId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Simulate GPT analysis + fetching
    const timer = setTimeout(() => {
      router.replace({
        pathname: '/nutrition/confirm-meal',
        params: { mealId }, // pass data forward
      });
    }, 3000); // pretend GPT takes 3 seconds

    return () => clearTimeout(timer);
  }, [mealId]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12 }}>Analyzing your meal...</Text>
    </View>
  );
}