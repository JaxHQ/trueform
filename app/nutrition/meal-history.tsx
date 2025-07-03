import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return `${y}-${m}-${day}`;
};

export default function MealHistoryScreen() {
  const TEST_ID = '9eaaf752-0f1a-44fa-93a1-387ea322e505';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [bodyweight, setBodyweight] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id ?? TEST_ID;
      setUserId(uid);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('mealid, meal_date, meal_name, description, protein, carbs, fat, calories, status')
        .eq('user_id', userId)
        .eq('meal_date', selectedDate)
        .order('meal_date', { ascending: false });

      if (error) {
        console.error('Meal history error:', error.message);
      } else {
        setMeals(data || []);
      }

      // Fetch bodyweight for the selected date and user
      const { data: bwData, error: bwError } = await supabase
        .from('bodyweight_logs')
        .select('weight')
        .eq('user_id', userId)
        .eq('log_date', selectedDate)
        .order('created_at', { ascending: false })   // newest first
        .limit(1)
        .maybeSingle();
      if (bwError) {
        console.error('Body‑weight fetch error:', bwError.message);
      } else {
        setBodyweight(bwData?.weight ?? null);
      }

      setLoading(false);
    })();
  }, [userId, selectedDate]);

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Meal History</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 3 }} />
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.mealid}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <>
              <View style={styles.dateNavigation}>
                <TouchableOpacity onPress={() => {
                  const prev = new Date(selectedDate + 'T00:00:00');
                  prev.setDate(prev.getDate() - 1);
                  setSelectedDate(formatDate(prev));
                }}>
                  <Ionicons name="chevron-back" size={20} color="#555" />
                </TouchableOpacity>
                <Text style={styles.dateText}>{selectedDate}</Text>
                <TouchableOpacity onPress={() => {
                  const next = new Date(selectedDate + 'T00:00:00');
                  next.setDate(next.getDate() + 1);
                  setSelectedDate(formatDate(next));
                }}>
                  <Ionicons name="chevron-forward" size={20} color="#555" />
                </TouchableOpacity>
              </View>
              {bodyweight !== null && (
                <View style={styles.bodyweightContainer}>
                  <Text style={styles.bodyweightText}>
                    📉 Bodyweight: {bodyweight} kg
                  </Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.mealItem}>
              <View>
                <Text style={styles.timeText}>{item.meal_date}</Text>
              </View>
              <View style={styles.mealDetails}>
                <Text style={styles.mealType}>{item.meal_name || item.description}</Text>
                <Text style={styles.description}>
                  P {item.protein}g | C {item.carbs}g | F {item.fat}g
                </Text>
              </View>
              <Text style={styles.calories}>{item.calories} kcal</Text>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalCalories}>{totalCalories} kcal</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 2 },
  header: {
    paddingTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#111' },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 1,
  },
  dateText: { fontSize: 16, fontWeight: '600', color: '#333' },
  bodyweightContainer: { marginBottom: 24, paddingHorizontal: 10 },
  bodyweightText: { fontSize: 16, fontWeight: '600', color: '#444' },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  timeText: { fontSize: 14, fontWeight: '600', color: '#666', marginRight: 12, width: 80 },
  mealDetails: { flex: 1 },
  mealType: { fontWeight: '700', fontSize: 17, marginBottom: 4, color: '#222' },
  description: { color: '#888', fontSize: 14 },
  calories: { fontWeight: '700', fontSize: 15, color: '#555', width: 80, textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 14,
    paddingHorizontal: 10,
  },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#111' },
  totalCalories: { fontSize: 18, fontWeight: '700', color: '#111' },
});
