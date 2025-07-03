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
                justifyContent: 'space-between',
                paddingVertical: 12,
                paddingHorizontal: 16,
                zIndex: 10,
              }}
            >
              {/* Home Button and Title */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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

              {/* Back Button */}
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content Below Header */}
            <View style={{ flex: 1 }}>
              <Slot />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}