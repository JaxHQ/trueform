import React from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarPlaceholder} />
          <Text style={styles.welcome}>Welcome back!</Text>
          <Text style={styles.name}>Jackson</Text>
        </View>

        {/* Goal Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Your Goal</Text>
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardText}>Gain 4 kg of muscle</Text>
          <Text style={styles.cardText}>Training 5 days/week</Text>
          <Text style={styles.cardText}>3,000 calories/day</Text>
          <Text style={styles.cardText}>Week 4 of 12</Text>
        </View>

        {/* Preferences Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Preferences</Text>
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardText}>Location: Gym</Text>
          <Text style={styles.cardText}>Recovery & Conditioning: ON</Text>
          <Text style={styles.cardText}>Injuries: Back tightness</Text>
        </View>

        {/* Footer Actions */}
        <View style={styles.footerRow}>
          <View style={{ flex: 1, marginHorizontal: 4 }}>
            <TouchableOpacity
              style={styles.sleekButton}
              onPress={() => router.push('/profile/settings')}
            >
              <Text style={styles.sleekButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginHorizontal: 4 }}>
            <TouchableOpacity style={styles.sleekButton} onPress={handleLogout}>
              <Text style={styles.sleekButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 48, // 👈 shifts everything down
    backgroundColor: '#fff',
    alignItems: 'center',
    flexGrow: 1,
    minHeight: Dimensions.get('window').height,
  },
  headerCard: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    marginBottom: 12,
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  xp: {
    fontSize: 14,
    color: '#666',
  },
  name: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fefefe',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
  },
  editButtonWrapper: {
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  sleekButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sleekButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});