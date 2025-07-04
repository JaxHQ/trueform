// app/(onboarding)/_layout.tsx
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, View } from 'react-native';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <Stack screenOptions={{ headerShown: true }} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}