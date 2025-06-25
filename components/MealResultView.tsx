import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  mealId: string;
}

export default function MealResultView({ mealId }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Results for Meal</Text>
      <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>{mealId}</Text>
      {/* Replace with your real macros + feedback UI */}
    </View>
  );
}