import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

export default function NutritionScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Calorie Summary */}
        <View style={styles.card}>
          <Text style={styles.title}>CALORIES</Text>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { flex: 0.3, backgroundColor: '#f77' }]} />
            <View style={[styles.barFill, { flex: 0.4, backgroundColor: '#7af' }]} />
            <View style={[styles.barFill, { flex: 0.3, backgroundColor: '#fa7' }]} />
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>PROTEIN{"\n"}0</Text>
            <Text style={styles.macroLabel}>CARBOHYDRAT{"\n"}0</Text>
            <Text style={styles.macroLabel}>FAT{"\n"}0</Text>
          </View>
        </View>

        {/* Meals Section */}
        {['BREAKFAST', 'LUNCH', 'DINNER'].map((meal, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.mealTitle}>{meal}</Text>
            <Text style={styles.mealPlaceholder}>[X]</Text>
          </View>
        ))}

        {/* Add Meal Button */}
        <TouchableOpacity style={styles.addMealBtn} onPress={() => {}}>
          <Text style={styles.addMealText}>Add Meal</Text>
        </TouchableOpacity>

        {/* Extra Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => {}}>
            <Text style={styles.secondaryText}>Meal History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => {}}>
            <Text style={styles.secondaryText}>Meal Ideas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height,
    paddingTop: 32,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fefefe',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  barBackground: {
    height: 16,
    borderRadius: 8,
    backgroundColor: '#eee',
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },
  barFill: {
    height: '100%',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
  mealTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  mealPlaceholder: {
    textAlign: 'center',
    color: '#999',
    fontSize: 28,
    marginTop: 20,
  },
  addMealBtn: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  addMealText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  secondaryText: {
    fontWeight: '600',
  },
});