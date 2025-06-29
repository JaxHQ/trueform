import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';

export default function NutritionLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <Stack
              screenOptions={{
                title: 'TrueForm',
                headerStyle: { backgroundColor: '#000' },
                headerTitleStyle: { color: '#fff' },
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => router.push('/nutrition')}
                    style={{ marginLeft: 15 }}
                  >
                    <Ionicons name="home-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                ),
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}