import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { vehiclesApi, tripsApi } from '../services/api';

export default function StartTripScreen() {
  const navigation = useNavigation<any>();
  const [assignedVehicle, setAssignedVehicle] = useState<any>(null);
  const [odometer, setOdometer] = useState('');
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [odometerPhoto, setOdometerPhoto] = useState<string | null>(null);
  const [passengerPhoto, setPassengerPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(true);

  useEffect(() => {
    fetchAssignedVehicle();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await Location.requestForegroundPermissionsAsync();
  };

  const fetchAssignedVehicle = async () => {
    try {
      const res = await vehiclesApi.getMyAssigned();
      setAssignedVehicle(res.data);
    } catch (error) {
      console.log('Failed to fetch assigned vehicle');
    } finally {
      setLoadingVehicle(false);
    }
  };

  const takePhoto = async (type: 'selfie' | 'odometer' | 'passenger') => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === 'selfie') setSelfiePhoto(uri);
      else if (type === 'odometer') setOdometerPhoto(uri);
      else setPassengerPhoto(uri);
    }
  };

  const startTrip = async () => {
    if (!assignedVehicle || !odometer || !selfiePhoto || !odometerPhoto) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});

      const tripRes = await tripsApi.start({
        vehicleId: assignedVehicle.id,
        startOdometer: parseFloat(odometer),
        startLatitude: location.coords.latitude,
        startLongitude: location.coords.longitude,
      });

      const tripId = tripRes.data.id;

      // Upload photos
      const uploadPhoto = async (uri: string, photoType: string) => {
        const formData = new FormData();
        formData.append('photo', { uri, type: 'image/jpeg', name: `${photoType}.jpg` } as any);
        formData.append('photoType', photoType);
        await tripsApi.uploadPhoto(tripId, formData);
      };

      await uploadPhoto(selfiePhoto, 'driver_selfie');
      await uploadPhoto(odometerPhoto, 'start_odometer');
      if (passengerPhoto) {
        await uploadPhoto(passengerPhoto, 'passenger');
      }

      navigation.replace('ActiveTrip', { trip: tripRes.data });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  if (loadingVehicle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!assignedVehicle) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noVehicleTitle}>No Vehicle Assigned</Text>
        <Text style={styles.noVehicleText}>
          Please contact your dispatcher or admin to get a vehicle assigned to you.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Assigned Vehicle</Text>
      <View style={styles.vehicleCard}>
        <Text style={styles.vehiclePlate}>{assignedVehicle.plateNumber}</Text>
        <Text style={styles.vehicleInfo}>{assignedVehicle.make} {assignedVehicle.model}</Text>
      </View>

      <Text style={styles.sectionTitle}>Odometer Reading</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter current odometer"
        value={odometer}
        onChangeText={setOdometer}
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Driver Selfie *</Text>
      <TouchableOpacity style={styles.photoButton} onPress={() => takePhoto('selfie')}>
        {selfiePhoto ? (
          <Image source={{ uri: selfiePhoto }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoButtonText}>Take Selfie</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Odometer Photo *</Text>
      <TouchableOpacity style={styles.photoButton} onPress={() => takePhoto('odometer')}>
        {odometerPhoto ? (
          <Image source={{ uri: odometerPhoto }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoButtonText}>Take Photo of Odometer</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Passenger Photo (Optional)</Text>
      <TouchableOpacity style={styles.photoButton} onPress={() => takePhoto('passenger')}>
        {passengerPhoto ? (
          <Image source={{ uri: passengerPhoto }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoButtonText}>Take Passenger Photo</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.startButton} onPress={startTrip} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.startButtonText}>Start Trip</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  noVehicleTitle: { fontSize: 22, fontWeight: 'bold', color: '#dc2626', marginBottom: 12 },
  noVehicleText: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24 },
  backButton: { marginTop: 24, backgroundColor: '#2563eb', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 15, marginBottom: 8 },
  vehicleCard: { backgroundColor: '#eff6ff', borderWidth: 2, borderColor: '#2563eb', borderRadius: 8, padding: 15 },
  vehiclePlate: { fontSize: 20, fontWeight: 'bold', color: '#1e40af' },
  vehicleInfo: { fontSize: 14, color: '#3b82f6', marginTop: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 15, fontSize: 16 },
  photoButton: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed', borderRadius: 8, height: 150, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoButtonText: { color: '#6b7280', fontSize: 16 },
  photoPreview: { width: '100%', height: '100%' },
  startButton: { backgroundColor: '#2563eb', padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 40 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
