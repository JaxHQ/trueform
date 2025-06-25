// app/nutrition/confirm-meal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

interface MealRow {
  id: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  feedback: string;
  status: string;
}

export default function ConfirmMealScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const router = useRouter();

  const [meal, setMeal] = useState<MealRow | null>(null);
  const [loading, setLoading] = useState(true);

  // ───────────────────────────────── fetch meal row
  useEffect(() => {
    const fetchMealData = async () => {
      if (!mealId) return;
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('mealid', mealId)
        .single();

      if (error) console.error('Error fetching meal:', error.message);
      setMeal(data as MealRow | null);
      setLoading(false);
    };

    fetchMealData();
  }, [mealId]);

  // ───────────────────────────────── handlers
  const handleConfirm = async () => {
    if (!mealId) return;

    // 1️⃣ mark the row complete
    const { error } = await supabase
      .from('meal_logs')
      .update({ status: 'complete' })     // ← or 'logged', whichever label you prefer
      .eq('mealid', mealId);

    if (error) {
      Alert.alert('Error', 'Could not save meal, please try again.');
      console.error(error.message);
      return;
    }

    // 3️⃣ go back to nutrition home
    router.replace('/nutrition');
  };

  const handleRetry = () => {
    router.replace('/nutrition/log-meal'); // plain log-meal screen
  };

  // ───────────────────────────────── render
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" />
        <Text>Loading meal info…</Text>
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' }}>
        <Text>Meal not found.</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Confirm Meal</Text>

      {/* macro boxes */}
      <View style={{ padding: 16, borderWidth: 1, borderRadius: 12, borderColor: '#ddd', marginBottom: 16, width: '110%', height: 120 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, marginHorizontal: -4 }}>
          {[
            { label: 'PROTEIN', value: meal.protein ?? 0 },
            { label: 'CARBS', value: meal.carbs ?? 0 },
            { label: 'FAT', value: meal.fat ?? 0 },
            { label: 'CALS', value: meal.calories ?? 0 },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                alignItems: 'center',
                width: 70,
                height: 72,
                borderWidth: 1,
                borderRadius: 8,
                marginHorizontal: 6,
                justifyContent: 'space-between',
                paddingVertical: 10
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.value}</Text>
              <Text style={{ fontSize: 8 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* feedback and buttons */}
      <View style={{ backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>✅ NUTRITION FEEDBACK</Text>
        <Text style={{ marginBottom: 24 }}>{meal.feedback}</Text>

        <TouchableOpacity
          style={{ borderWidth: 1, borderColor: 'black', padding: 12, borderRadius: 8, marginBottom: 12, backgroundColor: '#fff' }}
          onPress={handleConfirm}
        >
          <Text style={{ textAlign: 'center', fontWeight: 'bold', color: 'black' }}>Confirm & Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ borderWidth: 1, borderColor: 'black', padding: 12, borderRadius: 8, backgroundColor: '#fff' }}
          onPress={handleRetry}
        >
          <Text style={{ textAlign: 'center', fontWeight: 'bold', color: 'black' }}>Retry Estimate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}