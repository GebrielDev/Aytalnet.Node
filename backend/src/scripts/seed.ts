import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from '../config/database';
import { User, Driver, Vehicle, Trip, TripPhoto } from '../models';

const seed = async () => {
  await connectDatabase();

  console.log('Seeding database...');

  // Create admin user for dashboard
  const adminExists = await User.findOne({ where: { email: 'admin@fleet.com' } });
  if (!adminExists) {
    await User.create({
      email: 'admin@fleet.com',
      passwordHash: 'admin123',
      name: 'Admin User',
      role: 'admin',
    });
    console.log('Admin user created: admin@fleet.com / admin123');
  }

  // Create dispatcher for dashboard
  const dispatcherExists = await User.findOne({ where: { email: 'dispatcher@fleet.com' } });
  if (!dispatcherExists) {
    await User.create({
      email: 'dispatcher@fleet.com',
      passwordHash: 'dispatch123',
      name: 'Dispatcher User',
      role: 'dispatcher',
    });
    console.log('Dispatcher created: dispatcher@fleet.com / dispatch123');
  }

  // Create sample drivers for driver app
  const drivers = [
    { employeeId: 'DRV001', name: 'John Smith', email: 'john@fleet.com', phone: '555-0101', passwordHash: 'driver123', licenseNumber: 'DL-001-2024' },
    { employeeId: 'DRV002', name: 'Maria Garcia', email: 'maria@fleet.com', phone: '555-0102', passwordHash: 'driver123', licenseNumber: 'DL-002-2024' },
    { employeeId: 'DRV003', name: 'James Wilson', email: 'james@fleet.com', phone: '555-0103', passwordHash: 'driver123', licenseNumber: 'DL-003-2024' },
    { employeeId: 'DRV004', name: 'Sarah Johnson', email: 'sarah@fleet.com', phone: '555-0104', passwordHash: 'driver123', licenseNumber: 'DL-004-2024' },
    { employeeId: 'DRV005', name: 'Michael Brown', email: 'michael@fleet.com', phone: '555-0105', passwordHash: 'driver123', licenseNumber: 'DL-005-2024' },
  ];

  for (const driverData of drivers) {
    const exists = await Driver.findOne({ where: { email: driverData.email } });
    if (!exists) {
      await Driver.create(driverData);
      console.log(`Driver created: ${driverData.email} / driver123`);
    }
  }

  // Create sample vehicles
  const vehicles = [
    { plateNumber: 'ABC-1234', make: 'Toyota', model: 'Camry', year: 2022, vin: 'VIN001ABC2022', currentOdometer: 15000 },
    { plateNumber: 'XYZ-5678', make: 'Honda', model: 'Accord', year: 2023, vin: 'VIN002XYZ2023', currentOdometer: 8000 },
    { plateNumber: 'DEF-9012', make: 'Ford', model: 'F-150', year: 2021, vin: 'VIN003DEF2021', currentOdometer: 25000 },
    { plateNumber: 'GHI-3456', make: 'Chevrolet', model: 'Silverado', year: 2023, vin: 'VIN004GHI2023', currentOdometer: 12000 },
    { plateNumber: 'JKL-7890', make: 'Toyota', model: 'Highlander', year: 2024, vin: 'VIN005JKL2024', currentOdometer: 3500 },
    { plateNumber: 'MNO-2345', make: 'Nissan', model: 'Altima', year: 2022, vin: 'VIN006MNO2022', currentOdometer: 18000 },
  ];

  for (const vehicleData of vehicles) {
    const exists = await Vehicle.findOne({ where: { plateNumber: vehicleData.plateNumber } });
    if (!exists) {
      await Vehicle.create(vehicleData);
      console.log(`Vehicle created: ${vehicleData.plateNumber}`);
    }
  }

  // Get created drivers and vehicles for trips
  const allDrivers = await Driver.findAll();
  const allVehicles = await Vehicle.findAll();

  if (allDrivers.length > 0 && allVehicles.length > 0) {
    // Sample photo URLs (placeholder images)
    const samplePhotos = {
      driver_selfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      start_odometer: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      end_odometer: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      passenger: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
    };

    // Create sample trips
    const tripData = [
      {
        driverId: allDrivers[0].id,
        vehicleId: allVehicles[0].id,
        status: 'completed' as const,
        startTime: new Date('2026-02-01T08:00:00Z'),
        endTime: new Date('2026-02-01T10:30:00Z'),
        durationMinutes: 150,
        startOdometer: 15000,
        endOdometer: 15085,
        totalMileage: 85,
        startLatitude: 9.0054,
        startLongitude: 38.7636,
        startAddress: 'Bole Road, Addis Ababa',
        endLatitude: 9.0320,
        endLongitude: 38.7469,
        endAddress: 'Piassa, Addis Ababa',
      },
      {
        driverId: allDrivers[1].id,
        vehicleId: allVehicles[1].id,
        status: 'completed' as const,
        startTime: new Date('2026-02-02T09:15:00Z'),
        endTime: new Date('2026-02-02T11:45:00Z'),
        durationMinutes: 150,
        startOdometer: 8000,
        endOdometer: 8120,
        totalMileage: 120,
        startLatitude: 9.0107,
        startLongitude: 38.7612,
        startAddress: 'Meskel Square, Addis Ababa',
        endLatitude: 8.9806,
        endLongitude: 38.7578,
        endAddress: 'Kality, Addis Ababa',
      },
      {
        driverId: allDrivers[2].id,
        vehicleId: allVehicles[2].id,
        status: 'completed' as const,
        startTime: new Date('2026-02-03T07:30:00Z'),
        endTime: new Date('2026-02-03T09:00:00Z'),
        durationMinutes: 90,
        startOdometer: 25000,
        endOdometer: 25045,
        totalMileage: 45,
        startLatitude: 9.0227,
        startLongitude: 38.7468,
        startAddress: 'Merkato, Addis Ababa',
        endLatitude: 9.0054,
        endLongitude: 38.7636,
        endAddress: 'Bole Road, Addis Ababa',
      },
      {
        driverId: allDrivers[0].id,
        vehicleId: allVehicles[3].id,
        status: 'completed' as const,
        startTime: new Date('2026-02-05T14:00:00Z'),
        endTime: new Date('2026-02-05T16:30:00Z'),
        durationMinutes: 150,
        startOdometer: 12000,
        endOdometer: 12095,
        totalMileage: 95,
        startLatitude: 9.0054,
        startLongitude: 38.7636,
        startAddress: 'Bole Road, Addis Ababa',
        endLatitude: 9.0400,
        endLongitude: 38.7500,
        endAddress: 'CMC, Addis Ababa',
      },
      {
        driverId: allDrivers[3].id,
        vehicleId: allVehicles[4].id,
        status: 'completed' as const,
        startTime: new Date('2026-02-06T10:00:00Z'),
        endTime: new Date('2026-02-06T12:15:00Z'),
        durationMinutes: 135,
        startOdometer: 3500,
        endOdometer: 3575,
        totalMileage: 75,
        startLatitude: 9.0320,
        startLongitude: 38.7469,
        startAddress: 'Piassa, Addis Ababa',
        endLatitude: 9.0107,
        endLongitude: 38.7612,
        endAddress: 'Meskel Square, Addis Ababa',
      },
      {
        driverId: allDrivers[4].id,
        vehicleId: allVehicles[5].id,
        status: 'in_progress' as const,
        startTime: new Date('2026-02-08T08:30:00Z'),
        startOdometer: 18000,
        startLatitude: 9.0107,
        startLongitude: 38.7612,
        startAddress: 'Meskel Square, Addis Ababa',
      },
    ];

    // Check if trips already exist
    const existingTrips = await Trip.count();
    if (existingTrips === 0) {
      for (const trip of tripData) {
        const createdTrip = await Trip.create(trip);
        console.log(`Trip created: ID ${createdTrip.id} - ${trip.status}`);

        // Add photos for completed trips
        if (trip.status === 'completed') {
          await TripPhoto.bulkCreate([
            { tripId: createdTrip.id, photoType: 'driver_selfie', photoUrl: samplePhotos.driver_selfie, takenAt: trip.startTime },
            { tripId: createdTrip.id, photoType: 'start_odometer', photoUrl: samplePhotos.start_odometer, takenAt: trip.startTime },
            { tripId: createdTrip.id, photoType: 'end_odometer', photoUrl: samplePhotos.end_odometer, takenAt: trip.endTime! },
            { tripId: createdTrip.id, photoType: 'passenger', photoUrl: samplePhotos.passenger, takenAt: trip.startTime },
          ]);
          console.log(`  Photos added for trip ${createdTrip.id}`);
        } else {
          // In-progress trip only has start photos
          await TripPhoto.bulkCreate([
            { tripId: createdTrip.id, photoType: 'driver_selfie', photoUrl: samplePhotos.driver_selfie, takenAt: trip.startTime },
            { tripId: createdTrip.id, photoType: 'start_odometer', photoUrl: samplePhotos.start_odometer, takenAt: trip.startTime },
          ]);
          console.log(`  Start photos added for trip ${createdTrip.id}`);
        }
      }
    } else {
      console.log('Trips already exist, skipping trip creation');
    }
  }

  console.log('\n=== Seeding Complete ===');
  console.log('\nDashboard Login:');
  console.log('  admin@fleet.com / admin123');
  console.log('  dispatcher@fleet.com / dispatch123');
  console.log('\nDriver App Login (all use password: driver123):');
  console.log('  john@fleet.com');
  console.log('  maria@fleet.com');
  console.log('  james@fleet.com');
  console.log('  sarah@fleet.com');
  console.log('  michael@fleet.com');
  
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
