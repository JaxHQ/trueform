import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const LOCATIONS = ['Home', 'Gym', 'Body-weight'];
const EXPERIENCES = ['Beginner', 'Intermediate', 'Advanced'];
const PROGRAMS = ['TrueForm Program', 'My Own Program'];

export default function OnboardingWorkout() {
  const router = useRouter();

  const [location, setLocation] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [program, setProgram] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const saveAndNext = async () => {
    if (!location || !experience || !days || !program) {
      Alert.alert('Missing info', 'Please answer every section to continue.');
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
    workout_location: location,   
    experience_level: experience,
    days_per_week: days,
    program_preference: program,
  })
  .eq('user_id', userId);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.push('/(onboarding)/FinalizeSetup');
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
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>Workout preferences</Text>

            {/* Location */}
            <Text style={styles.section}>Where will you train?</Text>
            <View style={styles.row}>
              {LOCATIONS.map((opt) => (
                <Pill
                  key={opt}
                  label={opt}
                  selected={location === opt}
                  onPress={() => setLocation(opt)}
                />
              ))}
            </View>

            {/* Experience */}
            <Text style={styles.section}>Training experience</Text>
            <View style={styles.row}>
              {EXPERIENCES.map((opt) => (
                <Pill
                  key={opt}
                  label={opt}
                  selected={experience === opt}
                  onPress={() => setExperience(opt)}
                />
              ))}
            </View>

            {/* Days per week */}
            <Text style={styles.section}>Days per week</Text>
            <View style={styles.row}>
              {[...Array(7)].map((_, i) => {
                const val = i + 1;
                return (
                  <Pill
                    key={val}
                    label={`${val}`}
                    selected={days === val}
                    onPress={() => setDays(val)}
                  />
                );
              })}
            </View>

            {/* Program preference */}
            <Text style={styles.section}>Program preference</Text>
            <View style={styles.row}>
              {PROGRAMS.map((opt) => (
                <Pill
                  key={opt}
                  label={opt}
                  selected={program === opt}
                  onPress={() => setProgram(opt)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                !(location && experience && days && program) && { opacity: 0.4 }
              ]}
              disabled={loading || !(location && experience && days && program)}
              onPress={saveAndNext}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Next</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
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
  },
  pillText: {
    fontSize: 14,
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
    fontWeight: '600',
    fontSize: 16,
  },
});