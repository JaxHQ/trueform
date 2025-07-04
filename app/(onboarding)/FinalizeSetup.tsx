import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function FinalizeSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [extraNotes, setExtraNotes] = useState('');

  const scrollRef = useRef<ScrollView>(null);

  const handleExtraNotesFocus = () => {
    // Give the keyboard a moment, then scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

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
      description: extraNotes || userData.description,
      username: userData.username,
      target_weight: userData.target_weight,
      user_id: userData.user_id,
      email: userData.email,
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={64}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            paddingBottom: 120,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Review & Finalize</Text>

          <Text style={styles.row}>
            <Text style={styles.label}>Username: </Text>{userData.username}
          </Text>

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

          <Text style={styles.subtitle}>Anything else?</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add any other details to your goals or limitations.."
            placeholderTextColor="#555"
            multiline
            value={extraNotes}
            onChangeText={setExtraNotes}
            onFocus={handleExtraNotesFocus}
          />

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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 28,
    backgroundColor: '#ffffff',
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    marginBottom: 10,
    fontSize: 16,
    color: '#374151',
  },
  label: {
    fontWeight: '600',
    color: '#6b7280',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    minHeight: 110,
    textAlignVertical: 'top',
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#374151',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
  },
});