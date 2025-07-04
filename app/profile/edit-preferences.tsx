import { View, Text, Button, TextInput, Modal, TouchableOpacity, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

function ClassicDropdown({ label, value, setValue, options }: {
  label: string;
  value: string;
  setValue: (val: string) => void;
  options: string[];
}) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{ backgroundColor: '#f4f4f5', padding: 16, borderRadius: 12, marginBottom: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{label}</Text>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}
      >
        <Text style={{ color: value ? '#111827' : '#555' }}>{value || `Select ${label}`}</Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          onPress={() => setModalVisible(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}
        >
          <View style={{ backgroundColor: '#fff', marginHorizontal: 32, borderRadius: 12, padding: 16 }}>
            <ScrollView>
              {options.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    setValue(option);
                    setModalVisible(false);
                  }}
                  style={{ paddingVertical: 12 }}
                >
                  <Text style={{ fontSize: 16 }}>{option}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ paddingVertical: 12 }}>
                <Text style={{ fontSize: 16, color: '#888' }}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function EditPreferencesScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={64}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#ffffff', paddingTop: 24 }}>
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
            Edit Preferences
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <ClassicDropdown label="Language" value={language} setValue={setLanguage} options={['English', 'Japanese']} />
          <ClassicDropdown label="Location" value={location} setValue={setLocation} options={['Home', 'Gym']} />
          <ClassicDropdown label="Experience Level" value={experience} setValue={setExperience} options={['Beginner', 'Intermediate', 'Advanced']} />
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
                  .from('users')
                  .update({
                    ...(language !== '' && { language_preference: language }),
                    ...(location !== '' && { workout_location: location }),
                    ...(experience !== '' && { experience_level: experience }),
                  })
                  .eq('user_id', user.id);

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}