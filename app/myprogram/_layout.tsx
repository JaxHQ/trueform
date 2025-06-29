import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  TouchableOpacity
} from 'react-native';

export default function NutritionLayout() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              title: 'TrueForm',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => router.push('/nutrition')}
                  style={{ marginLeft: 15 }}
                >
                  <Ionicons name="home-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
              ),
            }}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}