import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ────── STATE ──────
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
            weight,
            language_preference
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

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text>Couldn’t load profile.</Text>
        <TouchableOpacity onPress={handleLogout} style={{ marginTop: 16 }}>
          <Text style={{ color: 'blue' }}>Log out</Text>
        </TouchableOpacity>
      </View>
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 48,
          paddingHorizontal: 24,
          backgroundColor: '#fff',
          flexGrow: 1,
          alignItems: 'center',
          minHeight: Dimensions.get('window').height,
        }}
        style={{ opacity: fadeAnim }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
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
            style={{ marginTop: 12 }}
            onPress={() => router.push('/profile/edit-goals')}
          >
            <Text style={{ color: '#007AFF', fontWeight: '600' }}>Edit Goals</Text>
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
          <Text style={styles.cardText}>
            Language: {userData.language_preference ?? '—'}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => router.push('/profile/edit-preferences')}
          >
            <Text style={{ color: '#007AFF', fontWeight: '600' }}>Edit Preferences</Text>
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
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 24,
    paddingTop: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexGrow: 1,
    minHeight: Dimensions.get('window').height,
  },
  headerCard: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  sleekButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  sleekButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
});