import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import CircularProgress from '../../components/ui/CircularProgress';
import { supabase } from '../../lib/supabase'; // adjust path if necessary
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ protein: 0, carbs: 0, fat: 0, calories: 0 });
  const [goals, setGoals] = useState({ protein: 0, carbs: 0, fat: 0, calories: 1 });
  const [weight, setWeight] = useState<number | null>(null);

  const TEST_ID = '9eaaf752-0f1a-44fa-93a1-387ea322e505';
  const getLocalISODate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id ?? TEST_ID;

      const today = getLocalISODate();
      // Try strict "today" filter first
      let { data: meals, error: mealsError } = await supabase
        .from('meal_logs')
        .select('protein, carbs, fat, calories')
        .eq('user_id', uid)
        .eq('meal_date', today)
        .eq('status', 'complete');

      // 💡 DEV fallback: if nothing returned (common in Expo when date format mismatches),
      // re‑query without the date filter so totals still show while testing.
      if (!mealsError && (meals?.length ?? 0) === 0) {
        console.log('No meals for exact date — falling back to all complete meals (DEV mode).');
        const { data: allMeals, error: allErr } = await supabase
          .from('meal_logs')
          .select('protein, carbs, fat, calories')
          .eq('user_id', uid)
          .eq('status', 'complete');

        if (!allErr) meals = allMeals;
      }

      if (mealsError) {
        console.error('Error fetching meals:', mealsError.message);
      } else {
        console.log('Meals fetched:', meals);
      }

      const sum = (k: 'protein' | 'carbs' | 'fat' | 'calories') =>
        meals?.reduce((s, m) => s + (m[k] ?? 0), 0) ?? 0;

      setTotals({
        protein: sum('protein'),
        carbs: sum('carbs'),
        fat: sum('fat'),
        calories: sum('calories'),
      });

      const { data: user } = await supabase
        .from('users')
        .select('protein_target, carbs_target, fat_target, weight')
        .eq('user_id', uid)
        .single();

      const p = user?.protein_target ?? 0;
      const c = user?.carbs_target ?? 0;
      const f = user?.fat_target ?? 0;
      setGoals({ protein: p, carbs: c, fat: f, calories: p * 4 + c * 4 + f * 9 });
      setWeight(user?.weight ?? null);

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>Hi, Jax 👋</Text>
        <View style={styles.achievementBox}>
          <TouchableOpacity onPress={() => console.log('Weight pressed')}>
            <Text style={styles.achievementText}>{weight ? `${weight}kg` : '--'}</Text>
          </TouchableOpacity>
          <Text style={styles.achievementLabel}>Bodyweight</Text>
        </View>
      </View>

      {/* Calorie Summary Section */}
      <View style={styles.card}>
        <View style={styles.ringPlaceholder}>
          <CircularProgress
            progress={Math.min(totals.calories / goals.calories, 1)}
            label={`${totals.calories} / ${goals.calories}`}
          />
        </View>
        <View style={styles.macrosRow}>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="restaurant-outline" size={18} color="#555" />
            <Text style={styles.macroText}>{totals.protein} / {goals.protein}</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="nutrition-outline" size={18} color="#555" />
            <Text style={styles.macroText}>{totals.carbs} / {goals.carbs}</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="egg-outline" size={18} color="#555" />
            <Text style={styles.macroText}>{totals.fat} / {goals.fat}</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
      </View>

      <View style={{ width: '100%', paddingVertical: 0, marginTop: 0, marginBottom: 12 }}>
        <TouchableOpacity style={[styles.blackButton, { width: '100%' }]} onPress={() => router.push('/nutrition/log-meal')}>
          <Text style={styles.blackButtonText}>Log Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Steps Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>STEPS</Text>
        <Text style={styles.sectionText}>0 of 8,000</Text>
        <View style={styles.progressBar}></View>
      </View>

      {/* Workout Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>TODAY’S WORKOUT</Text>
        <Text style={styles.sectionText}>You don’t have a workout planned today.</Text>
        <TouchableOpacity style={styles.blackButton}>
          <Text style={styles.blackButtonText}>Generate a New Workout</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <TouchableOpacity style={[styles.blackButton, { flex: 1 }]}>
            <Text style={styles.blackButtonText}>Conditioning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.blackButton, { flex: 1 }]}>
            <Text style={styles.blackButtonText}>Recovery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    padding: 16,
    alignItems: 'center',
    minHeight: Dimensions.get('window').height * 0.95,
    backgroundColor: '#fff',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
  },
  achievementBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  achievementText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  achievementLabel: {
    fontSize: 10,
    color: '#555',
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
    backgroundColor: '#fefefe',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  ringPlaceholder: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  calories: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#666',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  macroText: {
    fontSize: 12,
    color: '#333',
  },
  macroLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    marginBottom: 8,
    color: '#333',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 4,
  },
  blackButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 8,
  },
  blackButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 17,
  },
});