import { View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Adjust path if needed
import { KeyboardTypeOptions } from 'react-native';

export default function EditGoalsScreen() {
  const router = useRouter();
  const [goalType, setGoalType] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [trainingDays, setTrainingDays] = useState('');
  const [caloriesPerDay, setCaloriesPerDay] = useState('');
  const [proteinTarget, setProteinTarget] = useState('');
  const [carbsTarget, setCarbsTarget] = useState('');
  const [fatTarget, setFatTarget] = useState('');

  useEffect(() => {
    const fetchGoals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('users')
        .select('goal, target_weight, days_per_week, calorie_target, protein_target, carbs_target, fat_target')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch user goals', error);
      } else if (data) {
        setGoalType(data.goal || '');
        setTargetWeight(data.target_weight?.toString() || '');
        setTrainingDays(data.days_per_week?.toString() || '');
        setCaloriesPerDay(data.calorie_target?.toString() || '');
        setProteinTarget(data.protein_target?.toString() || '');
        setCarbsTarget(data.carbs_target?.toString() || '');
        setFatTarget(data.fat_target?.toString() || '');
      }
    };

    fetchGoals();
  }, []);

  const handleSave = async () => {
    // Get user ID from supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    // If no user, show error
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }
    const { error } = await supabase
      .from('users')
      .update({
        ...(goalType !== '' && { goal: goalType }),
        ...(targetWeight !== '' && { target_weight: Number(targetWeight) }),
        ...(trainingDays !== '' && { days_per_week: Number(trainingDays) }),
        ...(caloriesPerDay !== '' && { calorie_target: Number(caloriesPerDay) }),
        ...(proteinTarget !== '' && { protein_target: Number(proteinTarget) }),
        ...(fatTarget !== '' && { fat_target: Number(fatTarget) }),
        ...(carbsTarget !== '' && { carbs_target: Number(carbsTarget) }),
      })
      .eq('user_id', user.id);
    if (error) {
      Alert.alert('Error', 'Failed to update goals');
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Edit Goals</Text>

          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            {[
              { label: 'Goal Type', value: goalType, setter: setGoalType, placeholder: 'e.g. Lean Bulk, Fat Loss' },
              { label: 'Target Weight (kg)', value: targetWeight, setter: setTargetWeight, placeholder: 'e.g. 85', keyboard: 'numeric' },
              { label: 'Training Days per Week', value: trainingDays, setter: setTrainingDays, placeholder: 'e.g. 4', keyboard: 'numeric' },
              { label: 'Calories per Day', value: caloriesPerDay, setter: setCaloriesPerDay, placeholder: 'e.g. 2800', keyboard: 'numeric' },
              { label: 'Protein Target (g)', value: proteinTarget, setter: setProteinTarget, placeholder: 'e.g. 180', keyboard: 'numeric' },
              { label: 'Carbs Target (g)', value: carbsTarget, setter: setCarbsTarget, placeholder: 'e.g. 300', keyboard: 'numeric' },
              { label: 'Fat Target (g)', value: fatTarget, setter: setFatTarget, placeholder: 'e.g. 90', keyboard: 'numeric' },
            ].map(({ label, value, setter, placeholder, keyboard }, index) => (
              <View key={index} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{label}</Text>
                <TextInput
                  value={value}
                  onChangeText={setter}
                  placeholder={placeholder}
                  placeholderTextColor="#777"
                  keyboardType={(keyboard as KeyboardTypeOptions) || 'default'}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 10,
                  }}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Save Goals</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
