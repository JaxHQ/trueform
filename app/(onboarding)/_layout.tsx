// app/(onboarding)/_layout.tsx
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, SafeAreaView, View, Pressable, Text, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingLayout() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'black' }}>
              <Pressable onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </Pressable>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 12 }}>Onboarding</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}