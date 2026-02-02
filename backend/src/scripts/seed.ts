import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from '../config/database';
import { User, Driver, Vehicle } from '../models';

const seed = async () => {
  await connectDatabase();

  console.log('Seeding database...');

  // Create admin user
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

  // Create dispatcher
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

  // Create sample driver
  const driverExists = await Driver.findOne({ where: { email: 'driver@fleet.com' } });
  if (!driverExists) {
    await Driver.create({
      employeeId: 'DRV001',
      name: 'John Driver',
      email: 'driver@fleet.com',
      phone: '555-0100',
      passwordHash: 'driver123',
      licenseNumber: 'DL12345',
    });
    console.log('Driver created: driver@fleet.com / driver123');
  }

  // Create sample vehicles
  const vehicleExists = await Vehicle.findOne({ where: { plateNumber: 'ABC-1234' } });
  if (!vehicleExists) {
    await Vehicle.bulkCreate([
      { plateNumber: 'ABC-1234', make: 'Toyota', model: 'Camry', year: 2022, vin: 'VIN001ABC', currentOdometer: 15000 },
      { plateNumber: 'XYZ-5678', make: 'Honda', model: 'Accord', year: 2023, vin: 'VIN002XYZ', currentOdometer: 8000 },
      { plateNumber: 'DEF-9012', make: 'Ford', model: 'F-150', year: 2021, vin: 'VIN003DEF', currentOdometer: 25000 },
    ]);
    console.log('Sample vehicles created');
  }

  console.log('Seeding complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
