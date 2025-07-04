import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOALS = ['Fat Loss', 'Muscle Gain', 'Recomposition'];
const TRACKING = ['Strict Macro Tracking', 'Flexible Eating', 'I’m Not Sure Yet'];

export default function OnboardingNutrition() {
  const router = useRouter();
  const [goal, setGoal] = useState<string | null>(null);
  const [tracking, setTracking] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extraDetails, setExtraDetails] = useState('');
  const [targetWeight, setTargetWeight] = useState('');

  const saveAndFinish = async () => {
    if (!goal || !tracking || !targetWeight) {
      Alert.alert('Missing info', 'Please select goal, tracking preference, and enter target weight.');
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

    console.log('Submitting:', { userId, goal, tracking, targetWeight, extraDetails });
    const { error } = await supabase
      .from('users')
      .update({
        nutrition_goal: goal,
        tracking_style: tracking,
        onboarding_complete: true,
        description: extraDetails,
        target_weight: targetWeight ? parseFloat(targetWeight) : null,
      })
      .eq('user_id', userId);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.replace('/(onboarding)/FinalizeSetup'); // Navigate to final onboarding screen
  };

  const Pill = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        selected && { backgroundColor: '#000', borderColor: '#000', shadowOpacity: 0.15 },
      ]}
    >
      <Text style={[styles.pillText, selected && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f9f9f9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Nutrition Setup</Text>

          <View style={styles.sectionContainer}>
            <Text style={styles.section}>What is your primary goal?</Text>
            <View style={styles.row}>
              {GOALS.map((opt) => (
                <Pill
                  key={opt}
                  label={opt}
                  selected={goal === opt}
                  onPress={() => setGoal(opt)}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.section}>How do you want to approach food?</Text>
            <View style={styles.row}>
              {TRACKING.map((opt) => (
                <Pill
                  key={opt}
                  label={opt}
                  selected={tracking === opt}
                  onPress={() => setTracking(opt)}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.section}>Anything else you'd like us to know?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Additional info about your goals"
              value={extraDetails}
              onChangeText={setExtraDetails}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.section}>Target Weight (kg)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 75"
              keyboardType="numeric"
              value={targetWeight}
              onChangeText={setTargetWeight}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !(goal && tracking && targetWeight) && { opacity: 0.4 }]}
            disabled={loading || !(goal && tracking && targetWeight)}
            onPress={saveAndFinish}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Finish Setup</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    color: '#222',
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  pillText: {
    fontSize: 14,
    color: '#444',
  },
  button: {
    marginTop: 32,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 14,
    fontSize: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
});