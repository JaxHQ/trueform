import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function OnboardingStats() {
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!weight || !height) {
      Alert.alert('Missing info', 'Please enter both weight and height.');
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
      .update({ weight: Number(weight), height: Number(height) })
      .eq('user_id', userId);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.push('/(onboarding)/onboarding_workout');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let’s set your starting stats</Text>

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        placeholder="Weight (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        style={styles.input}
      />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        placeholder="Height (cm)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
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
