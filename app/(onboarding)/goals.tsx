// app/(onboarding)/goals.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOAL_OPTIONS = ['Maintain', 'Lose Fat', 'Gain Muscle'];

export default function OnboardingGoals() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selected) {
      Alert.alert('Choose a goal', 'Please select one to continue.');
      return;
    }

    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;

    if (!userId) {
      setLoading(false);
      Alert.alert('Auth error', 'User session not found.');
      return;
    }

    // update users.goal
    const { error } = await supabase
      .from('users')
      .update({ goal: selected })
      .eq('user_id', userId);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.push('/(onboarding)/stats');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What’s your primary goal?</Text>

      {GOAL_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => setSelected(option)}
          style={[
            styles.option,
            selected === option && styles.optionSelected,
          ]}
        >
          <Text
            style={[
              styles.optionText,
              selected === option && styles.optionTextSelected,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.button, !selected && { opacity: 0.4 }]}
        disabled={!selected || loading}
        onPress={handleNext}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Next</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionSelected: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});