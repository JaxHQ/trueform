// app/(onboarding)/onboarding_summary.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native';
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
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={true}
            scrollEventThrottle={16}
            decelerationRate="normal"
            contentInsetAdjustmentBehavior="automatic"
          >
            <Text style={styles.header}>Welcome, {data.username}!</Text>

            <Text style={styles.section}>✨ Your Nutrition Targets</Text>
            <View style={styles.card}>
              <Row label="Calories" value={`${data.calorie_target} kcal`} />
              <Row label="Protein" value={`${data.protein_target} g`} />
              <Row label="Carbs" value={`${data.carbs_target} g`} />
              <Row label="Fat" value={`${data.fat_target} g`} />
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
        </View>
      </KeyboardAvoidingView>
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
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safe: { 
    flex: 1, 
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    backgroundColor: '#fff',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 60, gap: 20 },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginTop: 6,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#fafafa',
    borderColor: '#f0f0f0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLabel: { fontWeight: '500', color: '#555' },
  rowValue: { fontWeight: '700', color: '#222' },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cta: {
    marginTop: 24,
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});