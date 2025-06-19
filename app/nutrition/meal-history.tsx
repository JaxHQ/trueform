import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const meals = [
  { id: '1', time: '8:00 AM', type: 'BREAKFAST', description: 'Oatmeal with berries', calories: 350 },
  { id: '2', time: '12:30 PM', type: 'LUNCH', description: 'Grilled chicken and salad', calories: 600 },
  { id: '3', time: '3:00 PM', type: 'SNACK', description: 'Apple, nuts', calories: 250 },
  { id: '4', time: '7:00 PM', type: 'DINNER', description: 'Salmon, quinoa, vegetables', calories: 750 },
];

export default function MealHistoryScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal History</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
        <TextInput placeholder="Search" style={styles.searchInput} />
      </View>

      <View style={styles.dateRow}>
        <Ionicons name="chevron-back" size={20} color="black" />
        <Text style={styles.dateText}>Today</Text>
        <Ionicons name="chevron-forward" size={20} color="black" />
      </View>

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mealItem}>
            <View>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <View style={styles.mealDetails}>
              <Text style={styles.mealType}>{item.type}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <Text style={styles.calories}>{item.calories} kcal</Text>
          </View>
        )}
      />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalCalories}>
          {meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  mealDetails: {
    flex: 1,
  },
  mealType: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    color: '#666',
  },
  calories: {
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
