import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import { saveToken, getToken as getStoredToken, removeToken } from '../utils/tokenStorage';

type AuthContextType = {
  isAuthenticated: boolean;
  authenticate: () => Promise<void>;
  logout: () => void;
  isBiometricSupported: boolean;
  setToken: (token: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  clearToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Check if running in development mode
const isTestEnvironment = __DEV__;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);

  // Check biometric support and load token on component mount
  useEffect(() => {
    checkBiometricSupport();
    loadToken();
  }, []);

  const loadToken = async () => {
    const storedToken = await getStoredToken();
    if (storedToken) {
      setTokenState(storedToken);
      setIsAuthenticated(true);
    }
  };

  const checkBiometricSupport = async () => {
    try {
      // Always return true for development mode to enable testing
      if (isTestEnvironment) {
        setIsBiometricSupported(true);
        return;
      }

      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    } catch (error) {
      setIsBiometricSupported(false);
    }
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    if (isTestEnvironment) {
      return new Promise((resolve) => {
        Alert.alert(
          'Development Mode',
          'This is a simulated biometric authentication. Would you like to authenticate?',
          [
            {
              text: 'Cancel',
              onPress: () => resolve(false),
              style: 'cancel',
            },
            {
              text: 'Authenticate',
              onPress: () => resolve(true),
            },
          ]
        );
      });
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      Alert.alert('Error', 'Failed to authenticate. Please try again.');
      return false;
    }
  };

  const authenticate = async () => {
    if (!isBiometricSupported && !isTestEnvironment) {
      Alert.alert('Error', 'Biometric authentication is not supported on this device');
      return;
    }

    const authenticated = await authenticateWithBiometrics();
    if (authenticated) {
      setIsAuthenticated(true);
    } else {
      Alert.alert('Error', 'Biometric authentication failed. Please try again.');
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    await clearToken();
  };

  const setToken = async (newToken: string) => {
    await saveToken(newToken);
    setTokenState(newToken);
  };

  const getToken = async () => {
    return await getStoredToken();
  };

  const clearToken = async () => {
    await removeToken();
    setTokenState(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated,
        authenticate,
        logout,
        isBiometricSupported,
        setToken,
        getToken,
        clearToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}