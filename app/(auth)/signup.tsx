// app/(auth)/signup.tsx
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      return Alert.alert('Missing fields', 'Please fill all fields');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Password Mismatch', 'Passwords do not match');
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return Alert.alert('Error', error.message);
    }

    if (!data.user?.email_confirmed_at) {
      Alert.alert('Reminder', 'Please confirm your email soon to unlock all features.');
    }

    router.navigate('/(auth)/start');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={confirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 60,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#4F46E5',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});