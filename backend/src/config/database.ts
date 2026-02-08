import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
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
      await sequelize.query(`
        ALTER TABLE drivers ADD COLUMN IF NOT EXISTS assigned_vehicle_id INTEGER
        REFERENCES vehicles(id) ON DELETE SET NULL;
      `);
      console.log('Migration: assigned_vehicle_id column ensured');
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
