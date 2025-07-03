import { View, Text, Button, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EditPreferencesScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingTop: 24 }}>

      <View style={{ paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
          Edit Preferences
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ backgroundColor: '#f4f4f5', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Language</Text>
          <TextInput
            value={language}
            onChangeText={setLanguage}
            placeholder="e.g. English, Japanese"
            placeholderTextColor="#555"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              fontSize: 16,
              color: '#111827',
            }}
          />
        </View>

        <View style={{ backgroundColor: '#f4f4f5', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Home, Gym"
            placeholderTextColor="#555"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              fontSize: 16,
              color: '#111827',
            }}
          />
        </View>

        <View style={{ backgroundColor: '#f4f4f5', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Experience Level</Text>
          <TextInput
            value={experience}
            onChangeText={setExperience}
            placeholder="e.g. Beginner, Intermediate, Advanced"
            placeholderTextColor="#555"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              fontSize: 16,
              color: '#111827',
            }}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
        <View style={{ backgroundColor: '#000', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
          <Text
            onPress={async () => {
              const {
                data: { user },
                error: userError,
              } = await supabase.auth.getUser();

              if (userError || !user) {
                console.error('User fetch error:', userError?.message);
                return;
              }

              const { error } = await supabase
                .from('profiles')
                .update({
                  ...(language !== '' && { language }),
                  ...(location !== '' && { workout_location: location }),
                  ...(experience !== '' && { experience_level: experience }),
                })
                .eq('id', user.id);

              if (error) {
                console.error('Update error:', error.message);
              } else {
                router.back();
              }
            }}
            style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}
          >
            Save Preferences
          </Text>
        </View>
      </View>
    </View>
  );
}