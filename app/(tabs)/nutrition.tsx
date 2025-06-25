import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase'; // adjust if path differs
import CircularProgress from '../../components/ui/CircularProgress';

export default function NutritionScreen() {
  const router = useRouter();

  // state for today's meals and totals
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);
  const [totals, setTotals] = useState({ protein: 0, carbs: 0, fat: 0, calories: 0 });
  const [userId, setUserId] = useState<string | null>(null);
  const [goals, setGoals] = useState({
    protein_goal: 0,
    carbs_goal: 0,
    fat_goal: 0,
    calories_goal: 0,
  });
  // helper : returns YYYY-MM-DD in device’s local timezone
  const getLocalISODate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;

      if (error || !userId) {
        console.error('Auth error:', error?.message || 'No user session found (using test ID)');
        // 🔧 DEV-ONLY fallback so Nutrition screen works in Expo Go without auth:
        setUserId('9eaaf752-0f1a-44fa-93a1-387ea322e505');
        return;
      }

      setUserId(userId);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const todayISO = getLocalISODate();

    const fetchMeals = async () => {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('mealid, meal_name, protein, carbs, fat, calories, status')
        .eq('user_id', userId)
        .eq('status', 'complete');

      if (error) {
        console.error('Fetch meals error:', error.message);
        setLoading(false);
        return;
      }

      console.log('Fetched meals:', data);

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

    const fetchGoals = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('protein_target, carbs_target, fat_target, weight')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Fetch goals error:', error.message);
      } else if (data) {
        setGoals({
          protein_goal: data.protein_target ?? 0,
          carbs_goal: data.carbs_target ?? 0,
          fat_goal: data.fat_target ?? 0,
          calories_goal: (data.protein_target ?? 0) * 4 + (data.carbs_target ?? 0) * 4 + (data.fat_target ?? 0) * 9,
        });
      }
    };

    fetchMeals();
    fetchGoals();
  }, [userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <CircularProgress
            progress={totals.calories / (goals.calories_goal || 1)}
            label={`${totals.calories} / ${goals.calories_goal} kcal`}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>MACROS</Text>

          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={{ fontSize: 12, color: '#333', marginBottom: 4, textAlign: 'center' }}>
            {totals.protein}g / {goals.protein_goal}g
          </Text>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { flex: totals.protein, backgroundColor: '#7a9' }]} />
            <View style={{ flex: Math.max(goals.protein_goal - totals.protein, 0) }} />
          </View>

          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={{ fontSize: 12, color: '#333', marginBottom: 4, textAlign: 'center' }}>
            {totals.carbs}g / {goals.carbs_goal}g
          </Text>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { flex: totals.carbs, backgroundColor: '#79c' }]} />
            <View style={{ flex: Math.max(goals.carbs_goal - totals.carbs, 0) }} />
          </View>

          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={{ fontSize: 12, color: '#333', marginBottom: 4, textAlign: 'center' }}>
            {totals.fat}g / {goals.fat_goal}g
          </Text>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { flex: totals.fat, backgroundColor: '#e9a' }]} />
            <View style={{ flex: Math.max(goals.fat_goal - totals.fat, 0) }} />
          </View>
        </View>


        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>TODAY'S MEALS</Text>
            <TouchableOpacity
              onPress={() => router.push('/nutrition/log-meal')}
              style={{ backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>+ Add Meal</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          {loading && (
            <ActivityIndicator size="small" style={{ marginTop: 12 }} />
          )}

          {!loading && meals.length === 0 && (
            <Text style={styles.mealPlaceholder}>No meals logged yet today.</Text>
          )}

          {!loading && meals.length > 0 && (
            meals.map((m) => (
              <View key={m.mealid} style={styles.mealCard}>
                <Text style={styles.mealTitle}>{m.meal_name || 'Meal'}</Text>
                <Text style={styles.mealInfo}>
                  Protein: {m.protein}g | Carbs: {m.carbs}g | Fat: {m.fat}g | {m.calories} kcal
                </Text>
              </View>
            ))
          )}

          <TouchableOpacity
            onPress={() => router.push('/nutrition/meal-history')}
            style={{ borderWidth: 1, borderColor: '#000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, alignSelf: 'center', marginTop: 12 }}
          >
            <Text style={{ color: '#000', fontWeight: 'bold' }}>Meal History</Text>
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
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginBottom: 12,
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
    fontWeight: '900',
    marginBottom: 4,
    fontSize: 16,
  },
  mealInfo: {
    fontSize: 12,
    color: '#666',
  },
  mealPlaceholder: {
    textAlign: 'center',
    color: '#999',
    fontSize: 28,
    marginTop: 20,
  },
  mealCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
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