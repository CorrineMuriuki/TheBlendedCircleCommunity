// Environment variables from Vite
const ENV = import.meta.env;

// API configuration
export const API_URL = ENV.VITE_API_URL || 'http://localhost:5000/api';
export const WS_URL = ENV.VITE_WS_URL || 'ws://localhost:5000/ws';

// Other client-side configuration
export const APP_NAME = 'The Blended Circle';
export const IS_PRODUCTION = ENV.PROD; 