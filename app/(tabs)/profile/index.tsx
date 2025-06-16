import { View, Text, Button, StyleSheet, ScrollView, Image } from 'react-native';
import { Dimensions } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.welcome}>Welcome back!</Text>
          <Text style={styles.xp}>XP Level 5</Text>
        </View>
      </View>

      {/* Goal Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Goal</Text>
        <Text style={styles.cardText}>Gain 4 kg of muscle</Text>
        <Text style={styles.cardText}>Training 5 days/week</Text>
        <Text style={styles.cardText}>3,000 calories/day</Text>
        <Text style={styles.cardText}>Week 4 of 12</Text>
      </View>

      {/* Preferences Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <Text style={styles.cardText}>Location: Gym</Text>
        <Text style={styles.cardText}>Recovery & Conditioning: ON</Text>
        <Text style={styles.cardText}>Injuries: Back tightness</Text>
        <View style={styles.editButtonWrapper}>
          <Button title="Edit Preferences" onPress={() => {}} />
        </View>
      </View>

      {/* Footer Actions */}
      <View style={styles.footerRow}>
        <Button title="Preferences" onPress={() => {}} />
        <Button title="App Settings" onPress={() => {}} />
        <Button title="Log Out" onPress={() => {}} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexGrow: 1, // makes the content grow to fill available height
   justifyContent: 'space-between', // adds spacing between cards
   minHeight: Dimensions.get('window').height,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    marginRight: 12,
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  xp: {
    fontSize: 14,
    color: '#666',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 4,
  },
  editButtonWrapper: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
  },
});