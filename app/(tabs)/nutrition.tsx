import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';   // adjust if path differs
import CircularProgress from '../../components/ui/CircularProgress';

// ————————————————————————————————
// Helper: YYYY-MM-DD in the device’s **local** timezone
// ————————————————————————————————
const getLocalDateString = () => new Date().toLocaleDateString('en-CA');

export default function NutritionScreen() {
  const router = useRouter();

  // ─── local state ──────────────────────────────────────────────────────────────
  const [loading,   setLoading]   = useState(true);
  const [meals,     setMeals]     = useState<any[]>([]);
  const [totals,    setTotals]    = useState({ protein: 0, carbs: 0, fat: 0, calories: 0 });
  const [userId,    setUserId]    = useState<string | null>(null);
  const [goals,     setGoals]     = useState({
    protein_goal: 0,
    carbs_goal:   0,
    fat_goal:     0,
    calories_goal: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const todayISO = getLocalDateString();

  // ─── fetch meals function (moved outside useEffect) ─────────────────────────────
  const fetchMeals = async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('meal_logs')
      .select('mealid, meal_name, protein, carbs, fat, calories, status, meal_date')
      .eq('user_id', userId)
      .eq('status', 'complete')
      .eq('meal_date', todayISO);

    if (error) {
      console.error('Fetch meals error:', error.message);
      setLoading(false);
      return;
    }

    setMeals(data || []);

    const sum = (k: 'protein' | 'carbs' | 'fat' | 'calories') =>
      data?.reduce((t, m) => t + (m[k] ?? 0), 0) ?? 0;

    setTotals({
      protein:   sum('protein'),
      carbs:     sum('carbs'),
      fat:       sum('fat'),
      calories:  sum('calories'),
    });
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMeals();
    setRefreshing(false);
  };

  // ─── fetch current user (or fallback to test) ────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;

      if (error || !uid) {
        console.warn('No auth session found — using test ID');
        setUserId('9eaaf752-0f1a-44fa-93a1-387ea322e505');
      } else {
        setUserId(uid);
      }
    })();
  }, []);

  // ─── fetch today’s meals + user goals whenever userId changes ────────────────
  useEffect(() => {
    if (!userId) return;

    fetchMeals();

    // goals
    const fetchGoals = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('protein_target, carbs_target, fat_target')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Fetch goals error:', error.message);
      } else if (data) {
        setGoals({
          protein_goal:  data.protein_target ?? 0,
          carbs_goal:    data.carbs_target   ?? 0,
          fat_goal:      data.fat_target     ?? 0,
          calories_goal:
            (data.protein_target ?? 0) * 4 +
            (data.carbs_target   ?? 0) * 4 +
            (data.fat_target     ?? 0) * 9,
        });
      }
    };

    fetchGoals();
  }, [userId]);

  // ─── UI ───────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.container, { flexGrow: 1 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#000"
            />
          }
          keyboardShouldPersistTaps="handled"
        >

          {/* Calorie Ring */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <CircularProgress
              progress={totals.calories / (goals.calories_goal || 1)}
              label={`${totals.calories} / ${goals.calories_goal} kcal`}
            />
          </View>

          {/* Macro Card */}
          <View style={styles.card}>
            <Text style={styles.title}>MACROS</Text>

            {(['Protein', 'Carbs', 'Fat'] as const).map((lbl, idx) => {
              const v   = totals[lbl.toLowerCase() as keyof typeof totals] as number;
              const tgt = goals[`${lbl.toLowerCase()}_goal` as keyof typeof goals] as number;
              const colors = ['#7a9', '#79c', '#e9a'];
              return (
                <View key={lbl} style={{ marginBottom: 12 }}>
                  <Text style={styles.macroLabel}>{lbl}</Text>
                  <Text style={styles.macroDetail}>{v}g / {tgt}g</Text>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { flex: v, backgroundColor: colors[idx] }]} />
                    <View style={{ flex: Math.max(tgt - v, 0) }} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Today's Meals */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>TODAY'S MEALS</Text>
              <TouchableOpacity
                onPress={() => router.push('/nutrition/log-meal')}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnTxt}>+ Add Meal</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />

            {loading && <ActivityIndicator size="small" style={{ marginTop: 12 }} />}

            {!loading && meals.length === 0 && (
              <Text style={styles.mealPlaceholder}>No meals logged yet today.</Text>
            )}

            {!loading && meals.length > 0 && (
              meals.map(m => (
                <View key={m.mealid} style={styles.mealCard}>
                  <Text style={styles.mealTitle}>{m.meal_name || 'Meal'}</Text>
                  <Text style={styles.mealInfo}>
                    Protein: {m.protein}g · Carbs: {m.carbs}g · Fat: {m.fat}g · {m.calories} kcal
                  </Text>

                  {/* delete button */}
                  <TouchableOpacity
                    onPress={() => Alert.alert(
                      'Delete Meal',
                      'Are you sure you want to delete this meal?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            const { error } = await supabase
                              .from('meal_logs')
                              .delete()
                              .eq('mealid', m.mealid);
                            if (!error) {
                              setMeals(prev => prev.filter(x => x.mealid !== m.mealid));
                              fetchMeals(); // refresh meals and totals
                            } else {
                              console.error('Delete error:', error.message);
                            }
                          },
                        },
                      ]
                    )}
                    style={styles.trashBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              ))
            )}

            <TouchableOpacity
              onPress={() => router.push('/nutrition/meal-history')}
              style={styles.histBtn}
            >
              <Text style={styles.histTxt}>Meal History</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ───────────── styles ───────────── */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    padding: 16,
    alignItems: 'center',
    minHeight: Dimensions.get('window').height,
    backgroundColor: '#fff',
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
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  macroLabel: { textAlign: 'center', fontSize: 12, fontWeight: '600' },
  macroDetail: { textAlign: 'center', fontSize: 12, marginBottom: 4, color: '#333' },
  barBackground: { height: 16, borderRadius: 8, backgroundColor: '#eee', flexDirection: 'row', overflow: 'hidden' },
  barFill: { height: '100%' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addBtn: { backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#ddd', marginBottom: 12 },
  mealPlaceholder: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 20 },
  mealCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    position: 'relative',
  },
  mealTitle: { fontWeight: '900', marginBottom: 4, fontSize: 16 },
  mealInfo: { fontSize: 12, color: '#666' },
  trashBtn: { position: 'absolute', top: 8, right: 8 },
  histBtn: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  histTxt: { color: '#000', fontWeight: 'bold' },
});