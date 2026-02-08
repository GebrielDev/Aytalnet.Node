import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
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
      setLoading(true);
      let active = null;
      let trips: any[] = [];
      try { const r = await tripsApi.getActiveTrip(); active = r.data; } catch (e) { /* no active trip */ }
      try { const r = await tripsApi.getMyTrips(); trips = Array.isArray(r.data) ? r.data : []; } catch (e) { /* endpoint may not exist yet */ }
      setActiveTrip(active);
      setRecentTrips(trips);
    } catch (e) {
      // never crash
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

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '-'; }
  };
  const fmtTime = (d: string) => {
    try { return new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); } catch { return '-'; }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {driver?.name || 'Driver'}</Text>
          <Text style={styles.sub}>ID: {driver?.employeeId || '\u2014'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Active trip banner */}
      {activeTrip && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => navigation.navigate('ActiveTrip', { trip: activeTrip })}
        >
          <View style={styles.activeDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activeTitle}>Trip in Progress</Text>
            <Text style={styles.activeSub}>{activeTrip.vehicle?.plateNumber || 'Vehicle'} \u2014 started {fmtTime(activeTrip.startTime)}</Text>
          </View>
          <Text style={styles.activeArrow}>{'\u203A'}</Text>
        </TouchableOpacity>
      )}

      {/* New Trip button \u2014 always visible at top */}
      <TouchableOpacity
        style={[styles.newTripBtn, activeTrip && styles.newTripBtnDisabled]}
        onPress={() => { if (!activeTrip) navigation.navigate('StartTrip'); else Alert.alert('Active Trip', 'Please end your current trip first.'); }}
      >
        <Text style={styles.newTripBtnText}>{activeTrip ? 'End Current Trip First' : '+ Start New Trip'}</Text>
      </TouchableOpacity>

      {/* Completed Trips Table */}
      <Text style={styles.sectionTitle}>Completed Trips</Text>

      <View style={styles.table}>
        {/* Table header */}
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.2 }]}>Date</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1 }]}>Vehicle</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 0.8 }]}>Duration</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 0.8, textAlign: 'right' }]}>Miles</Text>
        </View>

        {recentTrips.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No completed trips yet</Text>
          </View>
        ) : (
          recentTrips.map((t: any, i: number) => (
            <View key={t.id} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
              <View style={[styles.tableCell, { flex: 1.2 }]}>
                <Text style={styles.cellPrimary}>{fmtDate(t.endTime)}</Text>
                <Text style={styles.cellSecondary}>{fmtTime(t.startTime)} \u2013 {fmtTime(t.endTime)}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text style={styles.cellPrimary}>{t.vehicle?.plateNumber || '\u2014'}</Text>
                <Text style={styles.cellSecondary} numberOfLines={1}>{t.vehicle?.make ? t.vehicle.make + ' ' + t.vehicle.model : ''}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 0.8 }]}>
                <Text style={styles.cellPrimary}>{t.durationMinutes != null ? t.durationMinutes + ' min' : '\u2014'}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 0.8, alignItems: 'flex-end' }]}>
                <Text style={styles.cellPrimary}>{t.totalMileage != null ? t.totalMileage.toFixed(1) : '\u2014'}</Text>
                <Text style={styles.cellSecondary}>{t.startOdometer}\u2192{t.endOdometer}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scroll: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  sub: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },

  activeBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#86efac', borderRadius: 12, padding: 14, marginBottom: 14 },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e', marginRight: 12 },
  activeTitle: { fontSize: 16, fontWeight: '700', color: '#166534' },
  activeSub: { fontSize: 13, color: '#15803d', marginTop: 2 },
  activeArrow: { fontSize: 28, color: '#22c55e', fontWeight: '300' },

  newTripBtn: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  newTripBtnDisabled: { backgroundColor: '#93c5fd' },
  newTripBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },

  table: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tableHeaderRow: { backgroundColor: '#e5e7eb' },
  tableHeaderText: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRowEven: { backgroundColor: '#fff' },
  tableRowOdd: { backgroundColor: '#f9fafb' },
  tableCell: { justifyContent: 'center', paddingRight: 6 },
  cellPrimary: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  cellSecondary: { fontSize: 11, color: '#9ca3af', marginTop: 1 },

  emptyRow: { padding: 30, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#9ca3af' },
});
