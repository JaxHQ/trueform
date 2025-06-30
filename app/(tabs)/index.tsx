import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
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
  const [user, setUser] = useState<any>(null);

  const TEST_ID = '9eaaf752-0f1a-44fa-93a1-387ea322e505';
  const getLocalISODate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  const [uid, setUid] = useState<string>(TEST_ID);

  const updateWeight = () => {
    Alert.prompt(
      'Update Weight',
      'Enter your current body-weight (kg):',
      async (text) => {
        const newWeight = parseFloat(text);
        if (isNaN(newWeight)) return;

        setWeight(newWeight);
        const today = getLocalISODate();

        // Ensure users table is updated before logging weight
        const { error: userErr } = await supabase
          .from('users')
          .update({ weight: newWeight })
          .eq('user_id', uid);
        if (userErr) console.error('users update error:', userErr.message);

        /* --- 2. Check if we already logged weight today --- */
        const { data: existing, error: fetchErr } = await supabase
          .from('bodyweight_logs')
          .select('id')
          .eq('user_id', uid)
          .eq('log_date', today)
          .maybeSingle();

        if (fetchErr) {
          console.error('bw fetch error:', fetchErr.message);
          return;
        }

        if (!existing) {
          /* ---- No entry yet → INSERT ---- */
          const { error: insErr } = await supabase
            .from('bodyweight_logs')
            .insert({ user_id: uid, weight: newWeight, log_date: today });
          if (insErr) console.error('bw insert error:', insErr.message);
          else console.log('Weight logged:', today, newWeight);
        } else {
          /* ---- Already logged → ask to overwrite ---- */
          Alert.alert(
            'Already logged today',
            'Overwrite today’s body-weight entry?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Overwrite',
                style: 'destructive',
                onPress: async () => {
                  // Ensure users table is updated before overwriting log
                  const { error: userErr } = await supabase
                    .from('users')
                    .update({ weight: newWeight })
                    .eq('user_id', uid);
                  if (userErr) console.error('users update error:', userErr.message);
                  const { error: updErr } = await supabase
                    .from('bodyweight_logs')
                    .update({ weight: newWeight })
                    .eq('id', existing.id);
                  if (updErr) console.error('bw update error:', updErr.message);
                  else console.log('Weight updated:', today, newWeight);
                },
              },
            ],
            { cancelable: true }
          );
        }
      },
      'plain-text',
      weight ? `${weight}` : ''
    );
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const currentUid = data?.session?.user?.id ?? TEST_ID;
      setUid(currentUid);

      const today = getLocalISODate();
      // Try strict "today" filter first
      let { data: meals, error: mealsError } = await supabase
        .from('meal_logs')
        .select('protein, carbs, fat, calories')
        .eq('user_id', currentUid)
        .eq('meal_date', today)
        .eq('status', 'complete');

      // If nothing returned for today, log a warning (no fallback).
      if (!mealsError && (meals?.length ?? 0) === 0) {
        console.log('No meals for exact date — skipping totals (no fallback)');
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

      const { data: userData } = await supabase
        .from('users')
        .select('protein_target, carbs_target, fat_target, calorie_target, weight, username')
        .eq('user_id', currentUid)
        .single();

      const p = userData?.protein_target ?? 0;
      const c = userData?.carbs_target ?? 0;
      const f = userData?.fat_target ?? 0;
      const cal = userData?.calorie_target ?? (p * 4 + c * 4 + f * 9);
      setGoals({ protein: p, carbs: c, fat: f, calories: cal });
      setUser(userData);
      setWeight(userData?.weight ?? null);

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
        <Text style={styles.greeting}>Hi, {user?.username ?? 'friend'} 👋</Text>
        <View style={styles.achievementBox}>
          <TouchableOpacity onPress={updateWeight}>
            <Text style={styles.achievementText}>{weight ? `${weight}kg` : '--'}</Text>
          </TouchableOpacity>
          <Text style={styles.achievementLabel}>Bodyweight</Text>
        </View>
      </View>

      {/* Calorie Summary Section */}
      <View style={styles.card}>
        <View style={styles.ringPlaceholder}>
          <CircularProgress
            progress={goals.calories ? Math.min(totals.calories / goals.calories, 1) : 0}
            label={`${totals.calories} / ${goals.calories} kcal`}
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


      {/* Workout Section */}
      <View style={{ position: 'relative' }}>
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
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Coming Soon</Text>
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});