import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase'; // adjust if path differs

export default function NutritionScreen() {
  const router = useRouter();

  // state for today's meals and totals
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);
  const [totals, setTotals] = useState({ protein: 0, carbs: 0, fat: 0, calories: 0 });

  useEffect(() => {
    const todayISO = new Date().toISOString().slice(0, 10); // YYYY‑MM‑DD
    const userId = 'demo123'; // TODO get from auth

    const fetchMeals = async () => {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('mealid, mealtext, protein, carbs, fat, calories')
        .eq('user_id', userId)
        .eq('mealDate', todayISO)
        .eq('status', 'complete');

      if (error) {
        console.error('Fetch meals error:', error.message);
        setLoading(false);
        return;
      }

      setMeals(data || []);

      const sum = (fld: 'protein'|'carbs'|'fat'|'calories') =>
        data?.reduce((s: number, m: any) => s + (m[fld] ?? 0), 0) ?? 0;

      setTotals({
        protein: sum('protein'),
        carbs: sum('carbs'),
        fat: sum('fat'),
        calories: sum('calories'),
      });
      setLoading(false);
    };

    fetchMeals();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Calorie Summary */}
        <View style={styles.card}>
          <Text style={styles.title}>CALORIES</Text>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { flex: 0.3, backgroundColor: '#f77' }]} />
            <View style={[styles.barFill, { flex: 0.4, backgroundColor: '#7af' }]} />
            <View style={[styles.barFill, { flex: 0.3, backgroundColor: '#fa7' }]} />
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>PROTEIN{"\n"}{totals.protein}</Text>
            <Text style={styles.macroLabel}>CARB{"\n"}{totals.carbs}</Text>
            <Text style={styles.macroLabel}>FAT{"\n"}{totals.fat}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>TODAY'S MEALS</Text>
          {loading && (
            <ActivityIndicator size="small" style={{ marginTop: 12 }} />
          )}

          {!loading && meals.length === 0 && (
            <Text style={styles.mealPlaceholder}>No meals logged yet today.</Text>
          )}

          {!loading && meals.length > 0 && (
            meals.map((m) => (
              <View key={m.mealid} style={{ marginBottom: 12 }}>
                <Text style={styles.mealTitle}>{m.mealtext}</Text>
                <Text style={styles.macroLabel}>
                  P {m.protein}g | C {m.carbs}g | F {m.fat}g | {m.calories} kcal
                </Text>
              </View>
            ))
          )}

          <TouchableOpacity
            onPress={() => router.push('/nutrition/log-meal')}
            style={{ marginTop: 16, alignSelf: 'center' }}
          >
            <Ionicons name="add-circle-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Extra Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/nutrition/meal-history')}>
            <Text style={styles.secondaryText}>Meal History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height,
    paddingTop: 32,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fefefe',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  barBackground: {
    height: 16,
    borderRadius: 8,
    backgroundColor: '#eee',
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },
  barFill: {
    height: '100%',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
  mealTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  mealPlaceholder: {
    textAlign: 'center',
    color: '#999',
    fontSize: 28,
    marginTop: 20,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  secondaryText: {
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});