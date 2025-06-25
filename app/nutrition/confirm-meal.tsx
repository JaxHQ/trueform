// app/nutrition/confirm-meal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function ConfirmMealScreen() {
  const { mealId } = useLocalSearchParams();
  const router = useRouter();

  const [mealData, setMealData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMealData = async () => {
      if (!mealId) return;
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('id', mealId)
        .single();

      if (error) {
        console.error('Error fetching meal data:', error.message);
      } else {
        setMealData(data);
      }
      setLoading(false);
    };
    fetchMealData();
  }, [mealId]);

  const handleConfirm = () => {
    // Later: write confirmed meal to Supabase
    router.push('/nutrition');
  };

  const handleRetry = () => {
    router.push(`/nutrition/analyze-meal?pending=true&mealId=${mealId}`);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading meal info…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Confirm Meal
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>{mealData?.protein ?? 0}</Text>
          <Text>PROTEIN</Text>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>{mealData?.carbs ?? 0}</Text>
          <Text>CARBS</Text>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>{mealData?.fat ?? 0}</Text>
          <Text>FAT</Text>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>{mealData?.calories ?? 0}</Text>
          <Text>CALORIES</Text>
        </View>
      </View>

      <Text style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 4 }}>✅ NUTRITION FEEDBACK</Text>
      <Text style={{ marginBottom: 24 }}>
        {mealData?.feedback ?? 'No feedback available.'}
      </Text>

      <Button title="Confirm & Save" onPress={handleConfirm} />
      <View style={{ height: 12 }} />
      <Button title="Retry Analysis" onPress={handleRetry} color="orange" />
    </View>
  );
}