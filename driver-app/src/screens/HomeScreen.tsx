import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { tripsApi } from '../services/api';

export default function HomeScreen() {
  const { driver, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkActiveTrip = async () => {
    try {
      const res = await tripsApi.getActiveTrip();
      setActiveTrip(res.data);
    } catch (error) {
      console.log('No active trip');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkActiveTrip();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {driver?.name}</Text>
        <Text style={styles.employeeId}>ID: {driver?.employeeId}</Text>
      </View>

      <View style={styles.content}>
        {activeTrip ? (
          <View style={styles.activeTripCard}>
            <Text style={styles.activeTripTitle}>Active Trip</Text>
            <Text style={styles.activeTripInfo}>Vehicle: {activeTrip.vehicle?.plateNumber}</Text>
            <Text style={styles.activeTripInfo}>Started: {new Date(activeTrip.startTime).toLocaleTimeString()}</Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('ActiveTrip', { trip: activeTrip })}
            >
              <Text style={styles.buttonText}>Continue Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('StartTrip')}
          >
            <Text style={styles.startButtonText}>Start New Trip</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 30 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  employeeId: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  content: { flex: 1, justifyContent: 'center' },
  startButton: { backgroundColor: '#2563eb', padding: 20, borderRadius: 12, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  activeTripCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  activeTripTitle: { fontSize: 20, fontWeight: 'bold', color: '#059669', marginBottom: 10 },
  activeTripInfo: { fontSize: 16, color: '#374151', marginBottom: 5 },
  continueButton: { backgroundColor: '#059669', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutButton: { paddingVertical: 15, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontSize: 16 },
});
