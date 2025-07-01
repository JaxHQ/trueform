import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const supabaseClient = createClient(
  Constants.expoConfig?.extra?.supabaseUrl!,
  Constants.expoConfig?.extra?.supabaseAnonKey!
);

export default function OnboardingStart() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');

  React.useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email ?? '');
        setFullName(session.user.user_metadata?.full_name || '');
      }
    };
    fetchSession();
  }, []);

  const handleGetStarted = async () => {
    if (!userId) return;

    const { error, data } = await supabase
      .from('users')
      .update({ username, email })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Update error:', error);
    } else {
      console.log('User update success:', data);
    }

    router.push({
      pathname: '/(onboarding)/goals',
      params: { username },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TrueForm</Text>
      <Text style={styles.subtitle}>
        Your personalized fitness and nutrition companion
      </Text>
      <Text style={styles.usernameHint}>Create a username to get started</Text>
      {!userId && (
        <Text style={{ color: 'red', marginBottom: 20 }}>
          No user session detected
        </Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
      />
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#555',
  },
  usernameHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});