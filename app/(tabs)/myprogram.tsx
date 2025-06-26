import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyProgramScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.comingSoonOverlay}>
        <Text style={styles.comingSoonText}>Coming Soon</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Modify Prompt */}
        <View style={styles.card}>
          <Text style={styles.title}>Modify today’s workout?</Text>
          <Text style={styles.subtitle}>Tell me how you’re feeling, and I can adjust.</Text>
          {/* <TextInput style={styles.input} placeholder="How are you feeling?" /> */}
        </View>

        {/* Current Program Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>MY PROGRAM</Text>
          <View style={styles.innerCard}>
            <Text style={styles.programTitle}>Jackson’s Push/Pull/Legs Split</Text>
            <Text style={styles.programDetails}>Uploaded May 22 • 6 days</Text>
            {/* <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>View Full Program</Text></TouchableOpacity> */}
            {/* <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Start Workout</Text></TouchableOpacity> */}
          </View>
        </View>

        {/* Program Options */}
        <Text style={styles.secondaryLabel}>Using your own program</Text>
        <View style={styles.rowButtons}>
          {/* <TouchableOpacity style={styles.altButton}><Text>My Program</Text></TouchableOpacity> */}
          {/* <TouchableOpacity style={styles.altButton}><Text>TrueForm Plan</Text></TouchableOpacity> */}
        </View>

        {/* <TouchableOpacity style={styles.fullButton}><Text style={styles.buttonText}>Upload New Program</Text></TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.fullButton}><Text style={styles.buttonText}>Edit Current Program</Text></TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.fullButton}><Text style={styles.buttonText}>Reset Progress</Text></TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
    padding: 50,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  innerCard: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 12,
  },
  programTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  programDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  secondaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  altButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  fullButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  comingSoonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});