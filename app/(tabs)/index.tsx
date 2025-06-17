import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.username}>Hi Jackson</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.achievement}>🔥 95% Complete</Text>
        </TouchableOpacity>
      </View>

      {/* Calorie Summary Section */}
      <View style={styles.card}>
        <View style={styles.ringPlaceholder}>
          <Text style={styles.calories}>0</Text>
          <Text style={styles.caloriesLabel}>CALS REMAINING</Text>
        </View>
        <View style={styles.macrosRow}>
          <Text>1200 Protein</Text>
          <Text>185g Carbs</Text>
          <Text>25g Fat</Text>
        </View>
      </View>

      {/* Workout Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>TODAY’S WORKOUT</Text>
        <Text style={styles.sectionText}>You don’t have a workout planned today.</Text>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Generate a New Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Do Conditioning or Recovery Instead</Text>
        </TouchableOpacity>
      </View>

      {/* Steps Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>STEPS</Text>
        <Text style={styles.sectionText}>0 of 8,000</Text>
        <View style={styles.progressBar}></View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.smallButton}>
            <Text style={styles.buttonText}>Log Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton}>
            <Text style={styles.buttonText}>Start Recovery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton}>
            <Text style={styles.buttonText}>Add Water</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: Dimensions.get('window').height,
    backgroundColor: '#fff',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
  },
  achievement: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f57c00',
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#fefefe',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  ringPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  calories: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#666',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    marginBottom: 8,
    color: '#333',
  },
  button: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 6,
    alignItems: 'center',
  },
  smallButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 4,
  },
  buttonText: {
    color: '#000',
    fontWeight: '500',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});