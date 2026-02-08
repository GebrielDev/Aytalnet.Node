import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ActiveTripScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const trip = route.params?.trip;

  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const startTime = new Date(trip.startTime).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - startTime) / 1000);
      setDuration(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [trip.startTime]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndTrip = () => {
    Alert.alert('End Trip', 'Are you sure you want to end this trip?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Trip', onPress: () => navigation.navigate('EndTrip', { trip }) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <View style={styles.statusIndicator} />
        <Text style={styles.statusText}>Trip in Progress</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Vehicle</Text>
        <Text style={styles.infoValue}>{trip.vehicle?.plateNumber || 'N/A'}</Text>
        {trip.vehicle?.make && (
          <Text style={styles.infoSub}>{trip.vehicle.make} {trip.vehicle.model}</Text>
        )}
      </View>

      <View style={styles.durationCard}>
        <Text style={styles.durationLabel}>Duration</Text>
        <Text style={styles.durationValue}>{formatDuration(duration)}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Start Odometer</Text>
        <Text style={styles.infoValue}>{trip.startOdometer} mi</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Started At</Text>
        <Text style={styles.infoValue}>{new Date(trip.startTime).toLocaleString()}</Text>
      </View>

      <TouchableOpacity style={styles.endButton} onPress={handleEndTrip}>
        <Text style={styles.endButtonText}>End Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 20 },
  statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', padding: 15, borderRadius: 12, marginBottom: 20 },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', marginRight: 10 },
  statusText: { fontSize: 18, fontWeight: '600', color: '#166534' },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  infoLabel: { fontSize: 14, color: '#6b7280', marginBottom: 5 },
  infoValue: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  infoSub: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  durationCard: { backgroundColor: '#2563eb', padding: 25, borderRadius: 12, marginBottom: 15, alignItems: 'center' },
  durationLabel: { fontSize: 16, color: '#93c5fd', marginBottom: 5 },
  durationValue: { fontSize: 42, fontWeight: 'bold', color: '#fff' },
  endButton: { backgroundColor: '#ef4444', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
  endButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
