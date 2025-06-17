import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>Hi, Jax 👋</Text>
        <View style={styles.achievementBox}>
          <Text style={styles.achievementText}>6/7</Text>
          <Text style={styles.achievementLabel}>Logs this week</Text>
        </View>
      </View>

      {/* Calorie Summary Section */}
      <View style={styles.card}>
        <View style={styles.ringPlaceholder}>
          <Text style={styles.calories}>0</Text>
          <Text style={styles.caloriesLabel}>CALS REMAINING</Text>
        </View>
        <View style={styles.macrosRow}>
          <Text>120g Protein</Text>
          <Text>185g Carbs</Text>
          <Text>25g Fat</Text>
        </View>
      </View>

      {/* Workout Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>TODAY’S WORKOUT</Text>
        <Text style={styles.sectionText}>You don’t have a workout planned today.</Text>
        <TouchableOpacity style={styles.blackButton}>
          <Text style={styles.blackButtonText}>Generate a New Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.blackButton}>
          <Text style={styles.blackButtonText}>Do Conditioning or Recovery Instead</Text>
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
          <TouchableOpacity style={styles.blackButton}>
            <Text style={styles.blackButtonText}>Log Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.blackButton}>
            <Text style={styles.blackButtonText}>Start Recovery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.blackButton}>
            <Text style={styles.blackButtonText}>Add Water</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    padding: 16,
    alignItems: 'center',
    minHeight: Dimensions.get('window').height * 0.95,
    backgroundColor: '#fff',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
  },
  achievementBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  achievementText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  achievementLabel: {
    fontSize: 10,
    color: '#555',
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
  progressBar: {
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 4,
  },
  blackButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 8,
  },
  blackButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'column',
    gap: 8,
  },
});