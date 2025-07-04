// app/(onboarding)/FinalizeSetup.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function FinalizeSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [extraNotes, setExtraNotes] = useState('');

  /** Fetch user row once **/
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const userEmail = session?.user?.email;

      if (!userId) {
        Alert.alert('Auth error', 'No user session found.');
        router.replace('/(auth)/login');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select(
          `goal, weight, height, workout_location, experience_level, days_per_week, program_preference, description, username, target_weight, gender`
        )
        .eq('user_id', userId)
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        router.back();
        return;
      }

      setUserData({ ...data, user_id: userId, email: userEmail });
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!userData) return;
    Alert.alert(
      'Please wait',
      'We are finalizing your plan. This may take 10–20 seconds.'
    );
    setSubmitting(true);

    // Build payload for Make / GPT webhook
    const payload = {
      goal: userData.goal,
      weight: userData.weight,
      height: userData.height,
      workout_location: userData.workout_location,
      experience_level: userData.experience_level,
      days_per_week: userData.days_per_week,
      program_preference: userData.program_preference,
      description: userData.description,
      username: userData.username,
      target_weight: userData.target_weight,
      user_id: userData.user_id,
      email: userData.email,
      final_comment: extraNotes,
      gender: userData.gender, // Ensure this is explicitly included
    };

    try {
      const res = await fetch(
        'https://hook.eu2.make.com/wjspj9oimmjcw6enfsbgpikhxy49eozw',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error(`Webhook error ${res.status}`);

      const gptPlan = await res.json();

      const { error } = await supabase
        .from('users')
        .update({
          calorie_target: gptPlan.daily_calories,
          protein_target: gptPlan.protein_grams,
          carbs_target: gptPlan.carbs_grams,
          fat_target: gptPlan.fat_grams,
          onboarding_complete: true,
          description: extraNotes || userData.description,
          program_preference: gptPlan.program_preference,
          onboarding_summary: gptPlan.message || null,
          target_weight: userData.target_weight,
          gender: userData.gender,
        })
        .eq('user_id', userData.user_id);

      if (error) throw error;

      setSubmitting(false);
      router.replace('/(onboarding)/onboarding_summary');
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert('Error', err.message || 'Failed to finalize setup.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Review & Finalize</Text>

      <Text style={styles.row}>
        <Text style={styles.label}>Username: </Text>{userData.username}
      </Text>

      {/* Summary */}
      <View style={styles.card}>
        <Text style={styles.row}>
          <Text style={styles.label}>Goal: </Text>{userData.goal}
        </Text>
        <Text style={styles.row}>
          <Text style={styles.label}>Weight: </Text>{userData.weight} kg
        </Text>
        <Text style={styles.row}>
          <Text style={styles.label}>Height: </Text>{userData.height} cm
        </Text>
        <Text style={styles.row}>
          <Text style={styles.label}>Gender: </Text>{userData.gender}
        </Text>
        <Text style={styles.row}>
          <Text style={styles.label}>Workout Location: </Text>{userData.workout_location}
        </Text>
        <Text style={styles.row}>
          <Text style={styles.label}>Experience: </Text>{userData.experience_level}
        </Text>
        <Text style={styles.row}>
          <Text style={styles.label}>Days / Week: </Text>{userData.days_per_week}
        </Text>
        <Text style={styles.row}>
          <Text style={styles.label}>Program Preference: </Text>{userData.program_preference}
        </Text>
        {userData.description && (
          <Text style={styles.row}>
            <Text style={styles.label}>Notes: </Text>{userData.description}
          </Text>
        )}
      </View>

      {/* Extra notes */}
      <Text style={styles.subtitle}>Anything else?</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Add any other details to your goals or limitations.."
        placeholderTextColor="#555"
        multiline
        value={extraNotes}
        onChangeText={setExtraNotes}
      />

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.button,
          submitting && { opacity: 0.6 },
        ]}
        disabled={submitting}
        onPress={handleSubmit}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Finalize My Plan</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f2f4f7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    marginBottom: 8,
    fontSize: 15,
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fefefe',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});