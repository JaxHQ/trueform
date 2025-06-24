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
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Review Your Meal
      </Text>
      <Text>Meal ID: {mealId}</Text>
      <Text style={{ marginVertical: 8 }}>
        ✅ GPT estimated macros here (coming soon)
      </Text>
      <Text>
        ✍️ Feedback: "This was a well-balanced meal. Try adding more protein to
        your next snack."
      </Text>

      <Button title="Confirm & Save" onPress={handleConfirm} />
    </View>
  );
}