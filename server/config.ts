import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory path in ES modules
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

// Load environment variables from .env file if it exists
dotenv.config({ path: join(currentDirPath, '..', '.env') });

// Server configuration
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// MPESA API credentials
export const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
export const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;

// Other environment configurations
export const NODE_ENV = process.env.NODE_ENV || 'development'; 