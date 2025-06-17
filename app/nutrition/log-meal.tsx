import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function LogMealScreen() {
  const [description, setDescription] = useState('');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  const [calories, setCalories] = useState('0');
  const [gptFeedback, setGptFeedback] = useState(
    'Nice! This meal provides 41g of protein and moderate carbs. You’re close to your daily protein target.'
  );
  const [mealType, setMealType] = useState('Lunch');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Meal</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={mealType}
          onValueChange={(itemValue) => setMealType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Breakfast" value="Breakfast" />
          <Picker.Item label="Lunch" value="Lunch" />
          <Picker.Item label="Dinner" value="Dinner" />
          <Picker.Item label="Snack" value="Snack" />
        </Picker>
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
      </View>
      <Ionicons name="camera-outline" size={24} color="#555" style={styles.icon} />

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
        <Text style={styles.outlineButtonText}>Log Meal</Text>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  descriptionWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 120,
    flexDirection: 'column',
  },
  descriptionInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    textAlign: 'left',
  },
  icon: {
    marginLeft: 8,
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