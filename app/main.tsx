import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Text, SafeAreaView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router, Redirect } from 'expo-router';
import ChatComponent from '../components/chat/ChatComponent';
import { Ionicons } from '@expo/vector-icons';
import { useRepository } from '../contexts/RepositoryContext';

export default function MainScreen() {
  const { isAuthenticated, logout } = useAuth();
  const { refreshRepositories } = useRepository();

  useEffect(() => {
    if (isAuthenticated) {
      refreshRepositories();
    }
  }, [isAuthenticated, refreshRepositories]);

  const handleLogout = () => {
    logout();
    router.replace('/biometric');
  };

  const handleUpload = () => {
    router.push('/repositoryManagement');
  };

  if (!isAuthenticated) {
    return <Redirect href="/biometric" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Copilot</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ChatComponent />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 5,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#060606',
  },
});