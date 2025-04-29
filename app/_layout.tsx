import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '../hooks/useColorScheme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { RepositoryProvider } from '../contexts/RepositoryContext';
import { FileUploadProvider } from '../contexts/FileUploadContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { FileUploadProgressProvider } from '@/contexts/FileUploadProgressContext';
import GlobalUploadProgress from '@/components/common/GlobalUploadProgressBar';
import ErrorBoundary from '../components/ErrorBoundary';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/main');
    } else {
      router.replace('/biometric');
    }
  }, [isAuthenticated, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="biometric" options={{ gestureEnabled: false }} />
      <Stack.Screen name="main" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <WebSocketProvider>
            <RepositoryProvider>
              <FileUploadProvider>
                <FileUploadProgressProvider>
                  <PaperProvider>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                      <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
                        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                        <View style={{ flex: 1 }}>
                          <RootLayoutNav />
                        </View>
                        <GlobalUploadProgress />
                      </SafeAreaView>
                    </ThemeProvider>
                  </PaperProvider>
                </FileUploadProgressProvider>
              </FileUploadProvider>
            </RepositoryProvider>
          </WebSocketProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}