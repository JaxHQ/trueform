// app/profile/settings.tsx
import React from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();

  // Example toggles (these could be tied to AsyncStorage or Supabase columns)
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Stack.Screen options={{ title: 'Settings' }} />

          <View style={styles.container}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            {/* Notifications toggle */}
            <View style={styles.row}>
              <Text style={styles.label}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            </View>

            {/* Dark mode toggle */}
            <View style={styles.row}>
              <Text style={styles.label}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    color: '#222',
  },
});