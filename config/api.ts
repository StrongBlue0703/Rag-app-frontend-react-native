import Constants from 'expo-constants';

// API configuration
const DEV_BACKEND_URL = 'http://168.231.69.175:8000';
const PROD_BACKEND_URL = 'https://ebcf-157-157-221-30.ngrok-free.app'; // Change this to your production HTTPS URL
const DEV_WEBSOCKET_URL = 'ws://168.231.69.175:8000';
const PROD_WEBSOCKET_URL = 'wss://ebcf-157-157-221-30.ngrok-free.app'; // Change this to your production WSS URL

const isProduction = !__DEV__;

export const BACKEND_URL = isProduction ? PROD_BACKEND_URL : DEV_BACKEND_URL;
export const WEBSOCKET_URL = isProduction ? PROD_WEBSOCKET_URL : DEV_WEBSOCKET_URL;

// Function to get the appropriate URL based on the protocol
export const getApiUrl = (useWebSocket: boolean = false) => {
  return useWebSocket ? WEBSOCKET_URL : BACKEND_URL;
};