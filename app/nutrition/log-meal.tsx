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
import DropDownPicker from 'react-native-dropdown-picker';

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
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Breakfast', value: 'Breakfast' },
    { label: 'Lunch', value: 'Lunch' },
    { label: 'Dinner', value: 'Dinner' },
    { label: 'Snack', value: 'Snack' },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Log Meal</Text>
        <DropDownPicker
          open={open}
          value={mealType}
          items={items}
          setOpen={setOpen}
          setValue={setMealType}
          setItems={setItems}
          containerStyle={{ width: 160 }}
          style={{ marginBottom: 12 }}
        />
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
        <Ionicons name="camera-outline" size={24} color="#555" style={styles.icon} />
      </View>

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
    marginBottom: 12,
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