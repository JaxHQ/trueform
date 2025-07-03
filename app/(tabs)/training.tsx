import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrainerScreen() {
  const [input, setInput] = useState('');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.fullOverlay}>
        <Text style={styles.overlayText}>Coming Soon</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Status Update Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Let us know how you're feeling today</Text>
          <TextInput
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
            placeholder="Sore leg, low energy, etc."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Submit ↻</Text>
          </TouchableOpacity>
        </View>

        {/* Next Workout Section */}
        <View style={styles.card}>
          <Text style={styles.sectionSubTitle}>YOUR NEXT WORKOUT</Text>
          <Text style={styles.workoutTitle}>Upper Body • Day 14</Text>
          <Text style={styles.workoutDetail}>5 exercises</Text>
          <Text style={styles.workoutDetail}>Equipment: Gym</Text>
          <Text style={styles.workoutDetail}>Duration: 50–60 min</Text>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Breakdown Section */}
        <View style={styles.card}>
          <Text style={styles.sectionSubTitle}>WEEKLY MUSCLE BREAKDOWN</Text>
          <View style={styles.bar} />
          <View style={[styles.bar, { width: '70%' }]} />
          <View style={[styles.bar, { width: '50%' }]} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Text style={styles.buttonText}>New Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Text style={styles.buttonText}>Condition</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Text style={styles.buttonText}>Recovery</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
    minHeight: Dimensions.get('window').height,
    paddingTop: 40,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fefefe',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutDetail: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  bar: {
    height: 10,
    backgroundColor: '#aaa',
    borderRadius: 5,
    marginVertical: 6,
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: '#fff',
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
});