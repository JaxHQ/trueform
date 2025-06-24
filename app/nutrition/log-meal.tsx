import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function LogMealScreen() {
  const [description, setDescription] = useState('');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  const [calories, setCalories] = useState('0');
  const [gptFeedback, setGptFeedback] = useState(
    'Please add any useful info to help us give you the most accurate results.'
  );
  const [mealDateMode, setMealDateMode] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  const getMealDate = () => {
    const now = new Date();
    if (mealDateMode === 'today') return now.toISOString().split('T')[0];
    if (mealDateMode === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      return yest.toISOString().split('T')[0];
    }
    return customDate ? customDate.toISOString().split('T')[0] : now.toISOString().split('T')[0];
  };

  const submitForAnalysis = async () => {
    const mealDate = getMealDate();

    const payload = {
      userId: 'demo123',
      mealText: description,
      mealDate,
      mealTime: 'today',
      photoUrl: photoUris[0] || null,
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
        setGptFeedback(responseData.feedback || 'Thanks! Feedback received.');
        Alert.alert('Success', 'Meal submitted for analysis.');
      } else {
        Alert.alert('Error', 'Failed to submit meal. Try again.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
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
            quality: 0.7,
          });

          if (!result.canceled && result.assets?.length > 0) {
            setPhotoUris(prev => [...prev, result.assets[0].uri]);
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
            quality: 0.7,
          });

          if (!result.canceled && result.assets?.length > 0) {
            setPhotoUris(prev => [...prev, result.assets[0].uri]);
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
        {photoUris.map((uri, index) => (
          <View key={index} style={{ position: 'relative', marginRight: 8, marginBottom: 8 }}>
            <Image
              source={{ uri }}
              style={{ width: 60, height: 60, borderRadius: 6 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setPhotoUris(prev => prev.filter((_, i) => i !== index))}
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
            backgroundColor: description.trim() && photoUris.length > 0 ? '#000' : '#ccc',
          },
        ]}
        onPress={submitForAnalysis}
        disabled={!description.trim() || photoUris.length === 0}
      >
        <Text style={[styles.inlineSubmitButtonText, { color: '#fff' }]}>
          Submit for Analysis
        </Text>
      </TouchableOpacity>

      {/* Macro Inputs */}
      <View style={styles.macrosRow}>
        <TextInput style={styles.macroInput} value={protein} onChangeText={setProtein} keyboardType="numeric" />
        <TextInput style={styles.macroInput} value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
        <TextInput style={styles.macroInput} value={fat} onChangeText={setFat} keyboardType="numeric" />
        <TextInput style={styles.macroInput} value={calories} onChangeText={setCalories} keyboardType="numeric" />
      </View>
      <View style={styles.macroLabels}>
        <Text>PROTEIN</Text>
        <Text>CARBS</Text>
        <Text>FAT</Text>
        <Text>CALORIES</Text>
      </View>

      {/* GPT Feedback */}
      <Text style={styles.feedbackTitle}>GPT FEEDBACK</Text>
      <Text style={styles.feedbackText}>{gptFeedback}</Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.outlineButton}>
        <Text style={styles.outlineButtonText}>Retry Estimate</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.outlineButton}>
        <Text style={styles.outlineButtonText}>Submit</Text>
      </TouchableOpacity>
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
    minHeight: 120,
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
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  macroInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: '23%',
    textAlign: 'center',
    fontSize: 16,
  },
  macroLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
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