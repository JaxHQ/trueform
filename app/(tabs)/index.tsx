import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Alert, TextInput, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CircularProgress from '../../components/ui/CircularProgress';
import { supabase } from '../../lib/supabase'; // adjust path if necessary
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ protein: 0, carbs: 0, fat: 0, calories: 0 });
  const [goals, setGoals] = useState({ protein: 0, carbs: 0, fat: 0, calories: 1 });
  const [weight, setWeight] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [proteinPast7Days, setProteinPast7Days] = useState<Array<{ log_date: string; total_protein: number }>>([]);

  const TEST_ID = '9eaaf752-0f1a-44fa-93a1-387ea322e505';
  const getLocalISODate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  const [uid, setUid] = useState<string>(TEST_ID);

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Refetch logic for pull-to-refresh
  const refetchData = async () => {
    setLoading(true);
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

    // Fetch protein totals for past 7 days using the new RPC function
    const { data: protein7DaysData, error: protein7DaysError } = await supabase
      .rpc('get_protein_past_7_days', { user_id: currentUid });

    if (protein7DaysError) {
      console.error('Error fetching protein past 7 days:', protein7DaysError.message);
    } else {
      setProteinPast7Days(protein7DaysData ?? []);
      console.log('Protein past 7 days:', protein7DaysData);
    }

    setLoading(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetchData().then(() => setRefreshing(false));
  }, []);

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
    refetchData();
  }, []);

  // Define getMacroColor function with updated 10% threshold logic
  const getMacroColor = (consumed: number, target: number) => {
    if (target === 0) return '#333'; // default color if target is zero to avoid division by zero
    const diffRatio = (consumed - target) / target;
    const withinPad = Math.abs(diffRatio) <= 0.10; // Green if within 10%
    const overLimit = diffRatio > 0.10; // Red if over 10%
    if (withinPad) {
      return 'green';
    } else if (overLimit) {
      return 'red';
    } else {
      return '#333'; // neutral color
    }
  };

  const caloriesConsumed = totals.calories;
  const calorieGoal = goals.calories;
  const proteinConsumed = totals.protein;
  const proteinTarget = goals.protein;
  const carbsConsumed = totals.carbs;
  const carbsTarget = goals.carbs;
  const fatConsumed = totals.fat;
  const fatTarget = goals.fat;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 48,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />
        }
      >
        {/* Unified Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingHorizontal: 15,
          // Reduce or remove top padding to minimize excess space above
          paddingTop: 0,
          marginBottom: 18,
        }}>
          <Text style={{ fontSize: 22, fontWeight: '600' }}>Hi, Sax 👋</Text>
        </View>

        {/* Bodyweight box at top-right */}
        <View style={{
          position: 'absolute',
          top: insets.top -  0,
          right: 30,
          zIndex: 10
        }}>
          <TouchableOpacity onPress={updateWeight} activeOpacity={0.7}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: '#ccc',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '500' }}>{weight ? `${weight}kg` : '112kg'}</Text>
              <Text style={{ fontSize: 12, color: '#888' }}>Bodyweight</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Calorie Summary Section */}
        <View style={{ alignItems: 'center', width: '100%', marginBottom: 16 }}>
          <View style={[styles.card, { width: '100%', alignItems: 'stretch' }]}>
            <View style={styles.ringPlaceholder}>
              <CircularProgress
                progress={calorieGoal ? Math.min(caloriesConsumed / calorieGoal, 1) : 0}
                label={`${caloriesConsumed} / ${calorieGoal} kcal`}
                color={getMacroColor(caloriesConsumed, calorieGoal)}
              />
            </View>
            <View style={styles.macrosRow}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="restaurant-outline" size={18} color="#555" />
                <Text style={[styles.macroText, { color: getMacroColor(proteinConsumed, proteinTarget) }]}>
                  {proteinConsumed} / {proteinTarget}
                </Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="nutrition-outline" size={18} color="#555" />
                <Text style={[styles.macroText, { color: getMacroColor(carbsConsumed, carbsTarget) }]}>
                  {carbsConsumed} / {carbsTarget}
                </Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="egg-outline" size={18} color="#555" />
                <Text style={[styles.macroText, { color: getMacroColor(fatConsumed, fatTarget) }]}>
                  {fatConsumed} / {fatTarget}
                </Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Protein 7-Day Progress Chart */}
        <View style={[styles.card, { marginTop: 0, marginBottom: 16 }]}>
          <Text style={styles.sectionTitle}>Protein Intake – 7 Day Progress</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
            {proteinPast7Days.slice().reverse().map(({ log_date, total_protein }) => {
              const diffRatio = (total_protein - proteinTarget) / proteinTarget;
              const withinPad = Math.abs(diffRatio) <= 0.10;
              const hitTarget = withinPad;
              return (
                <View key={log_date} style={{ alignItems: 'center', marginHorizontal: 8 }}>
                  <View style={{
                    height: 100,
                    width: 24,
                    backgroundColor: hitTarget ? '#FFD700' : '#ddd',
                    justifyContent: 'flex-end',
                    borderRadius: 6,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      height: Math.min(total_protein / proteinTarget * 100, 100),
                      backgroundColor: hitTarget ? '#000' : '#aaa',
                      width: '100%',
                    }} />
                  </View>
                  <Text style={{ fontSize: 10.0, marginTop: 4 }}>{log_date.slice(5)}</Text>
                  {hitTarget && <Text style={{ fontSize: 14 }}>⭐</Text>}
                </View>
              );
            })}
          </ScrollView>
          <Text style={styles.sectionText}>Daily Target: {proteinTarget}g +/-10%</Text>
        </View>

        <View style={{ width: '100%', marginBottom: 16 }}>
          <TouchableOpacity style={[styles.blackButton, { width: '100%' }]} onPress={() => router.push('/nutrition/log-meal')}>
            <Text style={styles.blackButtonText}>Log Meal</Text>
          </TouchableOpacity>
        </View>

        {/* Send Feedback Button */}
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('jnhemopo@gmail.com?subject=TrueForm Feedback&body=Your feedback here...')
          }
          style={{
            backgroundColor: '#F1F1F1',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Send Feedback</Text>
        </TouchableOpacity>

        {/* Bottom bounce space */}
        <View style={{ height: 64 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Removed paddingTop and padding, not needed with SafeAreaView/ScrollView changes
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
    gap: 16,
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
    marginBottom: 0,
    backgroundColor: '#fefefe',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    gap: 16,
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
    gap: 16,
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