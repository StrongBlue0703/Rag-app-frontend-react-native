import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function BiometricScreen() {
  const { isAuthenticated, authenticate, isBiometricSupported } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authenticate();
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Redirect href="/main" />;
  }

  if (!isBiometricSupported) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Biometric authentication is not supported on this device.</Text>
        <Button mode="contained" onPress={() => {}}>
          Continue without biometrics
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My Copilot</Text>
      <Text style={styles.subtitle}>Please authenticate to continue</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <Button mode="contained" onPress={handleBiometricAuth} style={styles.button}>
          Authenticate
        </Button>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});