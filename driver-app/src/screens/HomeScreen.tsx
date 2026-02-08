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

  var loadData = function () {
    setLoading(true);
    var active: any = null;
    var trips: any[] = [];

    tripsApi.getActiveTrip()
      .then(function (r: any) { active = r.data; })
      .catch(function (_e: any) { /* no active trip */ })
      .then(function () {
        return tripsApi.getMyTrips()
          .then(function (r: any) {
            if (r && r.data && Array.isArray(r.data)) {
              trips = r.data;
            }
          })
          .catch(function (_e: any) { /* endpoint may not exist */ });
      })
      .then(function () {
        setActiveTrip(active);
        setRecentTrips(trips);
        setLoading(false);
      })
      .catch(function (_e: any) {
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(function onFocus() {
      loadData();
    }, [])
  );

  var handleLogout = function () {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  var fmtDate = function (d: string) {
    try {
      var dt = new Date(d);
      var m = dt.getMonth() + 1;
      var day = dt.getDate();
      var y = dt.getFullYear();
      return m + '/' + day + '/' + y;
    } catch (_e) {
      return '-';
    }
  };

  var fmtTime = function (d: string) {
    try {
      var dt = new Date(d);
      var h = dt.getHours();
      var min = dt.getMinutes();
      var ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      var minStr = min < 10 ? '0' + min : '' + min;
      return h + ':' + minStr + ' ' + ampm;
    } catch (_e) {
      return '-';
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  var driverName = 'Driver';
  if (driver && driver.name) { driverName = driver.name; }
  var driverId = '-';
  if (driver && driver.employeeId) { driverId = driver.employeeId; }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{'Hello, ' + driverName}</Text>
          <Text style={styles.sub}>{'ID: ' + driverId}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {activeTrip ? (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={function () { navigation.navigate('ActiveTrip', { trip: activeTrip }); }}
        >
          <View style={styles.activeDot} />
          <View style={styles.bannerBody}>
            <Text style={styles.activeTitle}>Trip in Progress</Text>
            <Text style={styles.activeSub}>
              {(activeTrip.vehicle && activeTrip.vehicle.plateNumber ? activeTrip.vehicle.plateNumber : 'Vehicle') + ' - started ' + fmtTime(activeTrip.startTime)}
            </Text>
          </View>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={activeTrip ? styles.newTripBtnDisabled : styles.newTripBtn}
        onPress={function () {
          if (!activeTrip) {
            navigation.navigate('StartTrip');
          } else {
            Alert.alert('Active Trip', 'Please end your current trip first.');
          }
        }}
      >
        <Text style={styles.newTripBtnText}>{activeTrip ? 'End Current Trip First' : '+ Start New Trip'}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Completed Trips</Text>

      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.thDate}>Date</Text>
          <Text style={styles.thVehicle}>Vehicle</Text>
          <Text style={styles.thDur}>Duration</Text>
          <Text style={styles.thMiles}>Miles</Text>
        </View>

        {recentTrips.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No completed trips yet</Text>
          </View>
        ) : null}

        {recentTrips.map(function (t: any, i: number) {
          var plate = '-';
          if (t.vehicle && t.vehicle.plateNumber) { plate = t.vehicle.plateNumber; }
          var makeModel = '';
          if (t.vehicle && t.vehicle.make) { makeModel = t.vehicle.make + ' ' + (t.vehicle.model || ''); }
          var dur = '-';
          if (t.durationMinutes != null) { dur = t.durationMinutes + ' min'; }
          var miles = '-';
          if (t.totalMileage != null) { miles = Number(t.totalMileage).toFixed(1); }

          var rowStyle = i % 2 === 0 ? styles.rowEven : styles.rowOdd;
          var key = t.id ? String(t.id) : String(i);

          return (
            <View key={key} style={rowStyle}>
              <View style={styles.colDate}>
                <Text style={styles.cellMain}>{fmtDate(t.endTime)}</Text>
                <Text style={styles.cellSub}>{fmtTime(t.startTime) + ' - ' + fmtTime(t.endTime)}</Text>
              </View>
              <View style={styles.colVehicle}>
                <Text style={styles.cellMain}>{plate}</Text>
                <Text style={styles.cellSub} numberOfLines={1}>{makeModel}</Text>
              </View>
              <View style={styles.colDur}>
                <Text style={styles.cellMain}>{dur}</Text>
              </View>
              <View style={styles.colMiles}>
                <Text style={styles.cellMain}>{miles}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scroll: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  sub: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },

  activeBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#86efac', borderRadius: 12, padding: 14, marginBottom: 14 },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e', marginRight: 12 },
  bannerBody: { flex: 1 },
  activeTitle: { fontSize: 16, fontWeight: '700', color: '#166534' },
  activeSub: { fontSize: 13, color: '#15803d', marginTop: 2 },

  newTripBtn: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  newTripBtnDisabled: { backgroundColor: '#93c5fd', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  newTripBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },

  table: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2 },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#e5e7eb', paddingVertical: 10, paddingHorizontal: 10 },
  thDate: { flex: 1.2, fontSize: 11, fontWeight: '700', color: '#6b7280' },
  thVehicle: { flex: 1, fontSize: 11, fontWeight: '700', color: '#6b7280' },
  thDur: { flex: 0.7, fontSize: 11, fontWeight: '700', color: '#6b7280' },
  thMiles: { flex: 0.6, fontSize: 11, fontWeight: '700', color: '#6b7280', textAlign: 'right' },
  rowEven: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowOdd: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  colDate: { flex: 1.2, paddingRight: 4 },
  colVehicle: { flex: 1, paddingRight: 4 },
  colDur: { flex: 0.7, justifyContent: 'center' },
  colMiles: { flex: 0.6, alignItems: 'flex-end', justifyContent: 'center' },
  cellMain: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
  cellSub: { fontSize: 10, color: '#9ca3af', marginTop: 1 },

  emptyRow: { padding: 30, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#9ca3af' },
});
