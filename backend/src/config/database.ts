import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Add assigned_vehicle_id column if it doesn't exist
    try {
      const [columns] = await sequelize.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'drivers' AND COLUMN_NAME = 'assigned_vehicle_id' AND TABLE_SCHEMA = DATABASE()"
      );
      if ((columns as any[]).length === 0) {
        await sequelize.query(
          'ALTER TABLE drivers ADD COLUMN assigned_vehicle_id INTEGER, ADD CONSTRAINT fk_driver_vehicle FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL'
        );
      }
      console.log('Migration: assigned_vehicle_id column ensured');
    } catch (migrationError) {
      console.log('Migration note:', (migrationError as Error).message);
    }

    // Change photo_url from VARCHAR(500) to TEXT to support base64 data URIs
    try {
      await sequelize.query(
        'ALTER TABLE trip_photos MODIFY COLUMN photo_url TEXT'
      );
      console.log('Migration: photo_url column changed to TEXT');
    } catch (migrationError) {
      console.log('Migration note:', (migrationError as Error).message);
    }

    await sequelize.sync();
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default sequelize;
