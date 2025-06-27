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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal History</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
        <TextInput placeholder="Search" style={styles.searchInput} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity onPress={() => {
          const prev = new Date(selectedDate + 'T00:00:00');
          prev.setDate(prev.getDate() - 1);
          setSelectedDate(formatDate(prev));
        }}>
          <Ionicons name="chevron-back" size={20} />
        </TouchableOpacity>
        <Text>{selectedDate}</Text>
        <TouchableOpacity onPress={() => {
          const next = new Date(selectedDate + 'T00:00:00');
          next.setDate(next.getDate() + 1);
          setSelectedDate(formatDate(next));
        }}>
          <Ionicons name="chevron-forward" size={20} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {bodyweight && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                📉 Bodyweight: {bodyweight} kg
              </Text>
            </View>
          )}
          <FlatList
            data={meals}
            keyExtractor={(item) => item.mealid}
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
          />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalCalories}>{totalCalories} kcal</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, height: 40 },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timeText: { fontSize: 14, fontWeight: 'bold', marginRight: 10 },
  mealDetails: { flex: 1 },
  mealType: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  description: { color: '#666' },
  calories: { fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalCalories: { fontSize: 16, fontWeight: 'bold', color: '#333' },
});
