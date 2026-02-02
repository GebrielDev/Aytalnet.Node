import dotenv from 'dotenv';

dotenv.config();

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change-refresh-secret',
  jwtExpiresIn: '1h',
  jwtRefreshExpiresIn: '7d',
  saltRounds: 10,
};
