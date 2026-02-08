import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { tripsApi } from '../services/api';

export default function HomeScreen() {
  const { driver, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [activeRes, tripsRes] = await Promise.all([
        tripsApi.getActiveTrip().catch(() => ({ data: null })),
        tripsApi.getMyTrips().catch(() => ({ data: [] })),
      ]);
      setActiveTrip(activeRes.data);
      setRecentTrips(tripsRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {driver?.name}</Text>
        <Text style={styles.employeeId}>ID: {driver?.employeeId}</Text>
      </View>

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

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Recent Trips</Text>
        {recentTrips.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No completed trips yet</Text>
          </View>
        ) : (
          recentTrips.map((item: any) => (
            <View key={item.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripDate}>{formatDate(item.endTime)}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.totalMileage?.toFixed(1) || '0'} mi</Text>
                </View>
              </View>
              <View style={styles.tripBody}>
                <Text style={styles.tripVehicle}>
                  {item.vehicle?.plateNumber || 'N/A'}
                  {item.vehicle?.make ? '  \u2022  ' + item.vehicle.make + ' ' + item.vehicle.model : ''}
                </Text>
                <Text style={styles.tripTime}>
                  {formatTime(item.startTime)} \u2192 {formatTime(item.endTime)}
                  {item.durationMinutes != null ? '  (' + item.durationMinutes + ' min)' : ''}
                </Text>
                <Text style={styles.tripOdometer}>
                  Odometer: {item.startOdometer} \u2192 {item.endOdometer}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 25 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  employeeId: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  startButton: { backgroundColor: '#2563eb', padding: 20, borderRadius: 12, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  activeTripCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  activeTripTitle: { fontSize: 20, fontWeight: 'bold', color: '#059669', marginBottom: 10 },
  activeTripInfo: { fontSize: 16, color: '#374151', marginBottom: 5 },
  continueButton: { backgroundColor: '#059669', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  historySection: { marginTop: 30 },
  historyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  emptyCard: { backgroundColor: '#fff', padding: 30, borderRadius: 12, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9ca3af' },
  tripCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tripDate: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  badge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#2563eb' },
  tripBody: {},
  tripVehicle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 3 },
  tripTime: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  tripOdometer: { fontSize: 13, color: '#9ca3af' },
  logoutButton: { paddingVertical: 20, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontSize: 16 },
});
