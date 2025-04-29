export interface APIConfig {
  baseUrl: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  apiPrefix: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';

const config: APIConfig = {
  baseUrl: isDevelopment 
    ? 'https://23b5-38-32-68-195.ngrok-free.app'  // Development API URL
    : process.env.EXPO_PUBLIC_API_URL || 'https://api.production.com',  // Production API URL
  maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/json'
  ],
  apiPrefix: '/api/v1'
};

export const getConfig = (): APIConfig => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || config.baseUrl;
  // Remove trailing slash if exists
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return {
    ...config,
    baseUrl: cleanBaseUrl,
    maxFileSize: process.env.EXPO_PUBLIC_MAX_FILE_SIZE 
      ? parseInt(process.env.EXPO_PUBLIC_MAX_FILE_SIZE, 10) 
      : config.maxFileSize,
    apiPrefix: process.env.EXPO_PUBLIC_API_PREFIX || config.apiPrefix
  };
};

export default getConfig;