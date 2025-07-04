// app/(onboarding)/goals.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              activeOpacity={0.8}
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
            style={[styles.button, (!selected || loading) && styles.buttonDisabled]}
            disabled={!selected || loading}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 36,
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 28,
    color: '#333',
    letterSpacing: 0.3,
  },
  option: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionSelected: {
    borderColor: '#111',
    backgroundColor: '#eee',
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  optionText: {
    fontSize: 17,
    textAlign: 'center',
    color: '#555',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#111',
    fontWeight: '700',
  },
  button: {
    marginTop: 26,
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});