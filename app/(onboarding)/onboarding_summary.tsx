// app/(onboarding)/onboarding_summary.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function OnboardingSummary() {
  const router = useRouter();
  // if the previous screen sent ?userId=… you can grab it:
  const { userId: routeUserId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      // 1) try to use the passed id ─ fall back to auth session
      let uid = typeof routeUserId === 'string' ? routeUserId : null;
      if (!uid) {
        const { data: s } = await supabase.auth.getSession();
        uid = s.session?.user.id ?? null;
      }
      if (!uid) {
        router.replace('/(auth)/login');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select(
          `username,
           calorie_target,
           protein_target,
           carbs_target,
           fat_target,
           program_preference,
           onboarding_summary`
        )
        .eq('user_id', uid)
        .single();

      if (error) console.error(error.message);
      setData(data);
      setLoading(false);
    };

    fetchPlan();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Couldn’t load your plan. Please try again.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Welcome, {data.username}!</Text>

        <Text style={styles.section}>✨ Your Nutrition Targets</Text>
        <View style={styles.card}>
          <Row label="Calories" value={`${data.calorie_target} kcal`} />
          <Row label="Protein" value={`${data.protein_target} g`} />
          <Row label="Carbs" value={`${data.carbs_target} g`} />
          <Row label="Fat" value={`${data.fat_target} g`} />
        </View>

        <Text style={styles.section}>🏋️ Training Plan</Text>
        <View style={styles.card}>
          <Row
            label="Program"
            value={
              data.program_preference === 'My Own Program'
                ? 'Your Own Program'
                : 'TrueForm-Built'
            }
          />
        </View>

        {data.onboarding_summary && (
          <>
            <Text style={styles.section}>📣 Coach’s Note</Text>
            <View style={styles.card}>
              <Text style={styles.message}>{data.onboarding_summary}</Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.ctaText}>Let’s Train!</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// simple reusable row
const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, gap: 16 },
  header: { fontSize: 24, fontWeight: '700' },
  section: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rowLabel: { fontWeight: '600', color: '#444' },
  rowValue: { fontWeight: '600' },
  message: { fontSize: 14, lineHeight: 20, color: '#333' },
  cta: {
    marginTop: 24,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});