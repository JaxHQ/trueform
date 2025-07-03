import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();

  // ────── STATE ──────
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any | null>(null);

  // ────── LOGOUT ──────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  // ────── FETCH USER ──────
  useEffect(() => {
    const fetchUser = async () => {
      // grab auth session (fallback to test uid in Expo Go)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUserData(null);
        setLoading(false);
        return;
      }

      const uid = session.user.id;

      const { data, error } = await supabase
        .from('users')
        .select(
          `
            username,
            nutrition_goal,
            protein_target,
            carbs_target,
            fat_target,
            calorie_target,
            days_per_week,
            workout_location,
            experience_level,
            targetWeight,
            weight
          `
        )
        .eq('user_id', uid)
        .single();

      if (error) console.error(error.message);
      setUserData(data);
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Couldn’t load profile.</Text>
        <TouchableOpacity onPress={handleLogout} style={{ marginTop: 16 }}>
          <Text style={{ color: 'blue' }}>Log out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const {
    username,
    nutrition_goal,
    protein_target,
    carbs_target,
    fat_target,
    calorie_target,
    days_per_week,
    workout_location,
    experience_level,
    targetWeight,
    weight,
  } = userData;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarPlaceholder} />
          <Text style={styles.welcome}>Welcome back!</Text>
          <Text style={styles.name}>{username ?? 'Friend'}</Text>
        </View>

        {/* Goal Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Your Goal</Text>
          </View>
          <Text style={styles.cardText}>{nutrition_goal ?? '—'}</Text>
          {targetWeight && (
            <Text style={styles.cardText}>
              Target weight: {targetWeight} kg
            </Text>
          )}
          {days_per_week && (
            <Text style={styles.cardText}>
              Training {days_per_week} day(s)/week
            </Text>
          )}
          {calorie_target && (
            <Text style={styles.cardText}>
              {calorie_target} calories / day
            </Text>
          )}
          {(protein_target || carbs_target || fat_target) && (
            <Text style={styles.cardText}>
              Macros: P{protein_target ?? '—'} / C{carbs_target ?? '—'} / F
              {fat_target ?? '—'}
            </Text>
          )}
          <TouchableOpacity
            style={{ marginTop: 8 }}
            onPress={() => router.push('/profile/edit-goals')}
          >
            <Text style={{ color: 'blue' }}>Edit Goals</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Preferences</Text>
          </View>
          <Text style={styles.cardText}>
            Location: {workout_location ?? '—'}
          </Text>
          <Text style={styles.cardText}>
            Experience: {experience_level ?? '—'}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 8 }}
            onPress={() => router.push('/profile/edit-preferences')}
          >
            <Text style={{ color: 'blue' }}>Edit Preferences</Text>
          </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.sleekButton}
              onPress={handleLogout}
            >
              <Text style={styles.sleekButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
    paddingTop: 48,
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
  footerRow: {
    flexDirection: 'row',
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