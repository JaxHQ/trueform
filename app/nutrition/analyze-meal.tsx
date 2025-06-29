// app/nutrition/analyze-meal.tsx
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function AnalyzeMeal() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: '#333' }}>Logging your meal…</Text>
      <Text style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
        Estimating macros and updating your nutrition stats. Hang tight! This may take 15 - 20 Seconds to get the best results.
      </Text>
    </View>
  );
}