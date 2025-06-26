// LogMealScreen.tsx – rewritten with local date fix, and no overwrite of text input

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { uploadPhotosToStorage } from '../../lib/uploadPhotos';
import { supabase } from '../../lib/supabase';
import * as Localization from 'expo-localization';

const userId = '9eaaf752-0f1a-44fa-93a1-387ea322e505';

// Returns YYYY-MM-DD in the device’s LOCAL calendar day
const getLocalDateString = (d: Date = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function LogMealScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [mealDateMode, setMealDateMode] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [localPhotoUris, setLocalPhotoUris] = useState<string[]>([]);
  const [showSavedMeals, setShowSavedMeals] = useState(false);
  const [selectedSavedMeal, setSelectedSavedMeal] = useState<any | null>(null);
  const [savedMeals, setSavedMeals] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('meal_name, protein, carbs, fat, calories')
        .eq('user_id', userId)
        .neq('meal_name', null)
        .order('meal_date', { ascending: false })
        .limit(50);
      if (!error && data) {
        const uniqueMeals = Array.from(new Map(data.map(item => [item.meal_name, item])).values());
        setSavedMeals(uniqueMeals);
      }
    })();
  }, []);

  const getMealDate = () => {
    if (mealDateMode === 'today') return getLocalDateString();
    if (mealDateMode === 'yesterday') {
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      return getLocalDateString(yest);
    }
    return customDate ? getLocalDateString(customDate) : getLocalDateString();
  };

  const submitForAnalysis = async () => {
    const mealDate = getMealDate();

    console.log('🟢 Final meal_date string =', mealDate);

    const debugPayload = {
      userId,
      mealText: description,
      mealDate,
      mealTime: mealDateMode,
      photoUrlsArray: localPhotoUris,
    };

    console.log('📦 Payload being sent to Make:', debugPayload);

    router.push({ pathname: '/nutrition/analyze-meal', params: { pending: 'true' } });

    let photoUrls: string[] = [];
    try {
      photoUrls = await uploadPhotosToStorage(localPhotoUris, userId);
    } catch (uploadError) {
      console.error('Error uploading photos:', uploadError);
    }

    const payload = {
      userId,
      mealText: description,
      mealDate,
      mealTime: mealDateMode,
      photoUrlsArray: Array.isArray(photoUrls) ? photoUrls : [],
    };

    try {
      const response = await fetch('https://hook.eu2.make.com/ri37mnljdnupccenx3p1b2b0374jvt1a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        const encodedPayload = encodeURIComponent(JSON.stringify(responseData));
        const mealId =
          responseData.mealId ??
          responseData.mealid ??
          responseData.MealId ??
          responseData.mealID;

        router.replace({
          pathname: '/nutrition/confirm-meal',
          params: mealId ? { mealId, payload: encodedPayload } : { error: 'noMealId' },
        });
      } else {
        console.error('Webhook error:', response.statusText);
        router.replace({ pathname: '/nutrition/analyze-meal', params: { error: 'submitFailed' } });
      }
    } catch (error) {
      console.error('Network error during webhook POST:', error);
      router.replace({ pathname: '/nutrition/analyze-meal', params: { error: 'networkError' } });
    }
  };

  const submitSavedMeal = async () => {
    if (!selectedSavedMeal) return;
    const mealDate = getMealDate();
    console.log('🟢 Final meal_date string =', mealDate); // This should show '2025-06-26'

    const debugPayload = {
      user_id: userId,
      meal_date: mealDate,
      meal_name: selectedSavedMeal.meal_name,
      feedback: 'Quick saved meal',
      protein: selectedSavedMeal.protein,
      carbs: selectedSavedMeal.carbs,
      fat: selectedSavedMeal.fat,
      calories: selectedSavedMeal.calories,
      status: 'complete',
    };

    console.log('📦 Payload being sent to Supabase:', debugPayload);

    const { data, error } = await supabase
      .from('meal_logs')
      .insert(debugPayload)
      .select('meal_date');

    console.log('🗂 Supabase returned meal_date:', data?.[0]?.meal_date);

    if (error) {
      Alert.alert('Error', 'Failed to save meal.');
      console.error('Supabase insert error:', error.message);
      return;
    }

    router.replace('/nutrition');
  };

  const handleAddPhoto = async () => {
    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return;

          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, allowsMultipleSelection: true, quality: 0.7 });
          if (!result.canceled && result.assets?.length > 0) setLocalPhotoUris(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') return;

          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, allowsMultipleSelection: true, quality: 0.7 });
          if (!result.canceled && result.assets?.length > 0) setLocalPhotoUris(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Log Meal</Text>
        <View style={{ flexDirection: 'row' }}>
          {['today', 'yesterday', 'custom'].map(mode => (
            <TouchableOpacity
              key={mode}
              onPress={() => {
                setMealDateMode(mode as any);
                if (mode === 'custom') Alert.alert('Date Picker Coming Soon');
              }}
              style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: mealDateMode === mode ? '#000' : '#eee', borderRadius: 6, marginLeft: 8 }}
            >
              <Text style={{ color: mealDateMode === mode ? '#fff' : '#000' }}>{mode === 'today' ? 'Today' : mode === 'yesterday' ? 'Yesterday' : 'Pick a date'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.descriptionWrapper}>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Chicken sandwich with lettuce and tomato"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlign="left"
          textAlignVertical="top"
        />
        <TouchableOpacity onPress={handleAddPhoto}>
          <Ionicons name="camera-outline" size={24} color="#555" style={styles.icon} />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {localPhotoUris.map((uri, index) => (
          <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
            <Image source={{ uri }} style={{ width: 60, height: 60, borderRadius: 6 }} resizeMode="cover" />
            <TouchableOpacity
              onPress={() => setLocalPhotoUris(prev => prev.filter((_, i) => i !== index))}
              style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#000', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.inlineSubmitButton, { backgroundColor: description.trim() || localPhotoUris.length > 0 ? '#000' : '#ccc' }]}
        onPress={submitForAnalysis}
        disabled={!description.trim() && localPhotoUris.length === 0}
      >
        <Text style={styles.inlineSubmitButtonText}>Submit for Analysis</Text>
      </TouchableOpacity>

      <View style={{ marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => setShowSavedMeals(!showSavedMeals)}
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fafafa' }}
        >
          <Text>{selectedSavedMeal?.meal_name || 'Select a saved or recent meal'}</Text>
        </TouchableOpacity>
        {showSavedMeals && (
          <ScrollView style={{ maxHeight: 120, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 4 }}>
            {savedMeals.map((meal, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  setSelectedSavedMeal(meal);
                  setShowSavedMeals(false);
                }}
                style={{ padding: 10, borderBottomWidth: idx < savedMeals.length - 1 ? 1 : 0, borderColor: '#eee' }}
              >
                <Text>{meal.meal_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {selectedSavedMeal && (
        <TouchableOpacity
          style={{ backgroundColor: '#000', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 }}
          onPress={submitSavedMeal}
        >
          <Text style={{ color: '#fff' }}>Submit Saved Meal</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', minHeight: Dimensions.get('window').height },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  descriptionWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8, flexDirection: 'row' },
  descriptionInput: { flex: 1, padding: 16, minHeight: 180, fontSize: 16 },
  icon: { marginLeft: 8 },
  inlineSubmitButton: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginBottom: 12 },
  inlineSubmitButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});