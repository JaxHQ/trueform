import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrainerScreen() {
  const [input, setInput] = useState('');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Status Update Section */}
        <View style={[styles.card, { marginBottom: 12 }]}> {/* Slightly tighter spacing */}
          <Text style={styles.sectionTitle}>Let us know how you're feeling today</Text>
          <TextInput
            style={[styles.input, { height: 150, textAlignVertical: 'top' }]}
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
        <View style={[styles.card, { marginBottom: 12 }]}>
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
        <View style={[styles.card, { marginBottom: 16 }]}>
          <Text style={styles.sectionSubTitle}>WEEKLY MUSCLE BREAKDOWN</Text>
          <View style={styles.bar} />
          <View style={[styles.bar, { width: '70%' }]} />
          <View style={[styles.bar, { width: '50%' }]} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button title="Generate Workout" onPress={() => {}} />
          <Button title="Start Condition" onPress={() => {}} />
          <Button title="Recovery / Mobility" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-start', // avoid space-between pushing cards apart
    minHeight: Dimensions.get('window').height,
    paddingTop: 32, // safe space from top
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fefefe',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    width: '100%',
  },
  button: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
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
    fontSize: 12,
    color: '#555',
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
    width: '100%',
    marginTop: 16,
    paddingBottom: 24,
  },
});