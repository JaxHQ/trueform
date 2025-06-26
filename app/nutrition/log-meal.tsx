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

const userId = '9eaaf752-0f1a-44fa-93a1-387ea322e505'; // TODO: Replace with dynamic user auth ID later

export default function LogMealScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  // const [gptFeedback, setGptFeedback] = useState(
  //   'Please add any useful info to help us give you the most accurate results.'
  // );
  // Removed macro state variables
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
        // unique list of recent meal objects by meal_name
        const uniqueMeals = Array.from(new Map(data.map(item => [item.meal_name, item])).values());
        setSavedMeals(uniqueMeals);
      }
    })();
  }, []);

  const getMealDate = () => {
    const now = new Date();
    if (mealDateMode === 'today') return now.toISOString().split('T')[0];
    if (mealDateMode === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      return yest.toISOString().split('T')[0];
    }
    // TODO: Replace this alert with a proper Date Picker modal
    return customDate ? customDate.toISOString().split('T')[0] : now.toISOString().split('T')[0];
  };

  const showAnalyzingScreen = () => {
    router.push({
      pathname: '/nutrition/analyze-meal',
    });
  };

  const submitForAnalysis = async () => {
    const mealDate = getMealDate();

    // Navigate immediately to analyzing screen with pending=true
    router.push({
      pathname: '/nutrition/analyze-meal',
      params: { pending: 'true' },
    });

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        const mealId =
          responseData.mealId ??
          responseData.mealid ??
          responseData.MealId ??
          responseData.mealID;

        router.replace({
          pathname: '/nutrition/confirm-meal',
          params: mealId ? { mealId } : { error: 'noMealId' },
        });
      } else {
        console.error('Webhook error:', response.statusText);
        router.replace({
          pathname: '/nutrition/analyze-meal',
          params: { error: 'submitFailed' },
        });
      }
    } catch (error) {
      console.error('Network error during webhook POST:', error);
      router.replace({
        pathname: '/nutrition/analyze-meal',
        params: { error: 'networkError' },
      });
    }
  };

  const submitSavedMeal = async () => {
    if (!selectedSavedMeal) return;

    const mealDate = getMealDate();

    // Insert a new completed meal straight into Supabase
    const { error } = await supabase.from('meal_logs').insert({
      user_id: userId,
      meal_date: mealDate,
      meal_name: selectedSavedMeal.meal_name,
      feedback: 'Quick saved meal',
      protein: selectedSavedMeal.protein,
      carbs: selectedSavedMeal.carbs,
      fat: selectedSavedMeal.fat,
      calories: selectedSavedMeal.calories,
      status: 'complete',
    });

    if (error) {
      Alert.alert('Error', 'Failed to save meal.');
      console.error('Supabase insert error:', error.message);
      return;
    }

    // Navigate directly back to Nutrition home
    router.replace('/nutrition');
  };

  const handleAddPhoto = async () => {
    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera access is required.');
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            allowsMultipleSelection: true,
            quality: 0.7,
          });

          if (!result.canceled && result.assets?.length > 0) {
            setLocalPhotoUris(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
            Alert.alert('Photo added!');
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Media library access is required.');
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            allowsMultipleSelection: true,
            quality: 0.7,
          });

          if (!result.canceled && result.assets?.length > 0) {
            setLocalPhotoUris(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
            Alert.alert('Photo added!');
          }
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
                if (mode === 'custom') {
                  Alert.alert('Date Picker Coming Soon'); // placeholder for date picker
                }
              }}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                backgroundColor: mealDateMode === mode ? '#000' : '#eee',
                borderRadius: 6,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: mealDateMode === mode ? '#fff' : '#000' }}>
                {mode === 'today' ? 'Today' : mode === 'yesterday' ? 'Yesterday' : 'Pick a date'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Description Input */}
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
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {localPhotoUris.map((uri, index) => (
          <View key={index} style={{ position: 'relative', marginRight: 8, marginBottom: 8 }}>
            <Image
              source={{ uri }}
              style={{ width: 60, height: 60, borderRadius: 6 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setLocalPhotoUris(prev => prev.filter((_, i) => i !== index))}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                backgroundColor: '#000',
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[
          styles.inlineSubmitButton,
          {
            backgroundColor: description.trim() || localPhotoUris.length > 0 ? '#000' : '#ccc',
          },
        ]}
        onPress={submitForAnalysis}
        disabled={!description.trim() && localPhotoUris.length === 0}
      >
        <Text style={[styles.inlineSubmitButtonText, { color: '#fff' }]}>
          Submit for Analysis
        </Text>
      </TouchableOpacity>

      {/* Saved Meals Dropdown */}
      <View style={{ marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => setShowSavedMeals(!showSavedMeals)}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: '#fafafa',
          }}
        >
          <Text style={{ fontSize: 16 }}>
            {selectedSavedMeal?.meal_name || 'Select a saved or recent meal'}
          </Text>
        </TouchableOpacity>
        {showSavedMeals && (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              marginTop: 4,
              backgroundColor: '#fff',
              maxHeight: 120,
            }}
          >
            <ScrollView>
              {savedMeals.map((meal, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setSelectedSavedMeal(meal);
                    setShowSavedMeals(false);
                  }}
                  style={{ paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: idx < savedMeals.length - 1 ? 1 : 0, borderColor: '#eee' }}
                >
                  <Text>{meal.meal_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {selectedSavedMeal && (
        <TouchableOpacity
          style={{
            backgroundColor: '#000',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 12,
          }}
          onPress={submitSavedMeal}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>Submit Saved Meal</Text>
        </TouchableOpacity>
      )}

      {/* Macro Inputs removed */}

      {/* GPT Feedback */}
      {/* <Text style={styles.feedbackTitle}>GPT FEEDBACK</Text>
      <Text style={styles.feedbackText}>{gptFeedback}</Text> */}

      {/* Buttons */}
      {/* <TouchableOpacity style={styles.outlineButton}>
        <Text style={styles.outlineButtonText}>Retry Estimate</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.outlineButton}>
        <Text style={styles.outlineButtonText}>Submit</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    minHeight: Dimensions.get('window').height,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inlinePickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    width: 150,
    height: 40,
    justifyContent: 'center',
  },
  inlinePicker: {
    height: 40,
    width: '100%',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  descriptionWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  descriptionInput: {
    flex: 1,
    padding: 16,
    minHeight: 180,
    fontSize: 16,
    textAlignVertical: 'top',
    textAlign: 'left',
  },
  icon: {
    marginLeft: 8,
  },
  inlineSubmitButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  inlineSubmitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // macrosRow, macroInput, macroLabels styles removed
  feedbackTitle: {
    fontWeight: '600',
    marginBottom: 6,
  },
  feedbackText: {
    marginBottom: 20,
    fontSize: 14,
    color: '#333',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  outlineButtonText: {
    fontWeight: 'bold',
  },
});