import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Text, SafeAreaView, Image, Animated, Dimensions, Pressable } from 'react-native';
import { router } from 'expo-router';
import ChatComponent from '../components/chat/ChatComponent';
import Header from '@/components/ui/Header';
 
const SIDEBAR_WIDTH = 260;

export default function MainScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
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
  chatContainer: {
    flex: 1,
    backgroundColor: '#060606',
  },
});