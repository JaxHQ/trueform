// app/nutrition/confirm-meal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

interface MealRow {
  mealid: string;          // primary key in DB
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  feedback: string;
  status: string;
  meal_date?: string;
  meal_name?: string;
  user_id?: string;
}

export default function ConfirmMealScreen() {
  const { mealId, payload } = useLocalSearchParams<{
    mealId: string;
    payload?: string;   // URL‑encoded JSON from GPT
  }>();
  const router = useRouter();

  const [meal, setMeal] = useState<MealRow | null>(null);
  const [loading, setLoading] = useState(true);

  // helper: parse & memoise GPT payload
  const gptMeal = React.useMemo<Partial<MealRow> | null>(() => {
    if (!payload) return null;
    try {
      return JSON.parse(decodeURIComponent(payload));
    } catch (err) {
      console.warn('[ConfirmMeal] failed to parse payload param:', err);
      return null;
    }
  }, [payload]);

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

      // ----- normalise GPT keys (mealId -> mealid) -----
      let normalised: Partial<MealRow> | null = null;
      if (gptMeal) {
        const tmp: any = { ...gptMeal };
        if (tmp.mealId && !tmp.mealid) tmp.mealid = tmp.mealId; // camel → snake mismatch
        normalised = tmp as Partial<MealRow>;
      }

      // ----- merge precedence: DB row ⊆ GPT payload -----
      let merged: MealRow | null = null;
      if (data) merged = { ...(data as MealRow) };

      if (normalised) {
        if (!merged) {
          // No row yet – create a shell from GPT payload
          merged = {
            mealid: normalised.mealid ?? mealId,
            protein: normalised.protein ?? 0,
            carbs: normalised.carbs ?? 0,
            fat: normalised.fat ?? 0,
            calories: normalised.calories ?? 0,
            feedback: normalised.feedback ?? '',
            status: normalised.status ?? 'computed',
            meal_name: normalised.meal_name ?? '',
            meal_date: normalised.meal_date,
            user_id: normalised.user_id,
          };
        } else {
          // Row exists – overlay GPT values
          merged = { ...merged, ...normalised };
        }
        console.log('👀 merged row =', merged);
      } else {
        console.log('👀 fetched row =', data);
      }

      setMeal(merged);
      setLoading(false);
    };

    fetchMealData();
  }, [mealId, gptMeal]);

  // ───────────────────────────────── handlers
  const handleConfirm = async () => {
    if (!meal) return;
    console.log('✅ confirming with meal_date =', meal.meal_date);

    // Build the full row we want stored
    const payload = {
      mealid: meal.mealid ?? mealId,  // ← use real PK
      user_id: meal.user_id ?? null,
      meal_name: meal.meal_name,
      meal_date: gptMeal?.meal_date ?? meal.meal_date,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      calories: meal.calories,
      feedback: meal.feedback,
      status: 'complete',
    };

    const { error } = await supabase
      .from('meal_logs')
      .upsert(payload, { onConflict: 'mealid' });

    if (error) {
      Alert.alert('Error', 'Could not save meal, please try again.');
      console.error('Supabase upsert error:', error.message);
      return;
    }

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

      <Text style={{ textAlign: 'center', marginBottom: 4 }}>
        {meal.meal_name} • {meal.meal_date}
      </Text>

      {/* macro boxes */}
      <View style={{ padding: 16, borderWidth: 1, borderRadius: 12, borderColor: '#ddd', marginBottom: 16, width: '100%', height: 120 }}>
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
                flex: 1,
                minWidth: 60,
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