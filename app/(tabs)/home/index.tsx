import { View, Text, Button, StyleSheet, ScrollView, Dimensions } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        <View style={styles.buttonWrapper}>
          <Button title="Generate a New Workout" onPress={() => {}} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Do Conditioning or Recovery Instead" onPress={() => {}} />
        </View>
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
          <Button title="Log Meal" onPress={() => {}} />
          <Button title="Start Recovery" onPress={() => {}} />
          <Button title="Add Water" onPress={() => {}} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Dimensions.get('window').height * 0.9,
    backgroundColor: '#fff',
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
  buttonWrapper: {
    marginVertical: 6,
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