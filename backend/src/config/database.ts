import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Use PostgreSQL if DATABASE_URL is provided (Railway), otherwise SQLite for local dev
const useSqlite = !process.env.DATABASE_URL;

let sequelize: Sequelize;

if (useSqlite) {
  // SQLite for local development - no installation required
  const dbPath = path.join(__dirname, '../../data/fleet.db');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else {
  // PostgreSQL for production (Railway)
  sequelize = new Sequelize(process.env.DATABASE_URL!, {
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
}

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default sequelize;
