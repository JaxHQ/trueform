'use client';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Modal, Pressable, FlatList } from 'react-native';
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
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [genderModalVisible, setGenderModalVisible] = useState(false);

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
      .update({ username, email, gender })
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
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to TrueForm</Text>
        <Text style={styles.subtitle}>
          Your personalized fitness and nutrition companion
        </Text>
        <Text style={styles.usernameHint}>Select your gender</Text>
        <View style={styles.pickerWrapper}>
          <Pressable onPress={() => setGenderModalVisible(true)} style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={{ color: gender ? '#000' : '#999' }}>
              {gender || 'Select...'}
            </Text>
            <Text style={{ fontSize: 16, color: '#999' }}>▼</Text>
          </Pressable>
          <Modal visible={genderModalVisible} transparent animationType="slide">
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContainer}>
                {['Male', 'Female'].map(option => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      setGender(option as 'Male' | 'Female');
                      setGenderModalVisible(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setGenderModalVisible(false)} style={styles.modalCancel}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
  },
  usernameHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 28,
    fontSize: 16,
    backgroundColor: '#fff',
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
  pickerWrapper: {
    width: '100%',
    marginBottom: 28,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    width: '100%',
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalCancel: {
    marginTop: 12,
  },
  modalCancelText: {
    color: '#999',
    textAlign: 'center',
  },
});