import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI || '',
  mongoDnsServers: process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1',
  jwtSecret: process.env.JWT_SECRET || 'replace-this-secret-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
