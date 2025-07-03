import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot, router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';

export default function NutritionLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={80}
        >
          <View style={{ flex: 1 }}>
            {/* 🧠 Custom Top Header Bar */}
            <View
              style={{
                backgroundColor: '#000',
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                zIndex: 10,
              }}
            >
              <TouchableOpacity onPress={() => router.push('/nutrition')}>
                <Ionicons name="home-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: '600',
                  marginLeft: 12,
                }}
              >
                TrueForm
              </Text>
            </View>

            {/* Scrollable Content Below Header */}
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 24, backgroundColor: '#000' }}
              keyboardShouldPersistTaps="handled"
              bounces={true}
            >
              <Slot />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}