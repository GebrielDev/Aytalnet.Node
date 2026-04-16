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
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#86efac' },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', marginRight: 12 },
  statusText: { fontSize: 17, fontWeight: '700', color: '#166534' },
  infoCard: { backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  infoLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  infoSub: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
  durationCard: { backgroundColor: '#2563eb', padding: 28, borderRadius: 20, marginBottom: 14, alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  durationLabel: { fontSize: 14, color: '#93c5fd', marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  durationValue: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  endButton: { backgroundColor: '#ef4444', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 'auto', shadowColor: '#ef4444', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  endButtonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});
