// app/nutrition/confirm-meal.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ConfirmMealScreen() {
  const { mealId } = useLocalSearchParams();
  const router = useRouter();

  const handleConfirm = () => {
    // Later: write confirmed meal to Supabase
    router.push('/nutrition'); // back to Nutrition main or history
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Confirm Meal
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>0</Text>
          <Text>PROTEIN</Text>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>0</Text>
          <Text>CARBS</Text>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>0</Text>
          <Text>FAT</Text>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>0</Text>
          <Text>CALORIES</Text>
        </View>
      </View>

      <Text style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 4 }}>✅ NUTRITION FEEDBACK</Text>
      <Text style={{ marginBottom: 24 }}>
        This meal provides 41g of protein and moderate carbs. You're close to your daily protein target.
      </Text>

      <Button title="Confirm & Save" onPress={handleConfirm} />
    </View>
  );
}