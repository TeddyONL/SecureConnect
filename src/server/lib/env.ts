import { config } from 'dotenv';
import { resolve } from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';

config({
  path: resolve(__dirname, `../../../${envFile}`),
});

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});