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

    const { error } = await supabase
      .from('users')
      .update({
        nutrition_goal: goal,
        tracking_style: tracking,
        onboarding_complete: true,
        description: extraDetails,
        targetWeight: targetWeight ? parseInt(targetWeight) : null,
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
        selected && { backgroundColor: '#000', borderColor: '#000' },
      ]}
    >
      <Text style={[styles.pillText, selected && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Nutrition Setup</Text>

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

          <Text style={styles.section}>Anything else you'd like us to know?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Additional info about your goals"
            value={extraDetails}
            onChangeText={setExtraDetails}
            multiline
          />

          <Text style={styles.section}>Target Weight (kg)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 75"
            keyboardType="numeric"
            value={targetWeight}
            onChangeText={setTargetWeight}
          />

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
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 14,
  },
  button: {
    marginTop: 24,
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
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
});