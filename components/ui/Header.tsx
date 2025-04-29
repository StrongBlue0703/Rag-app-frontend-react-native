import React, { useEffect, useState, useRef, Fragment } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Text, SafeAreaView, Image, Animated, Dimensions, Pressable } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router, Redirect, usePathname } from 'expo-router';
import ChatComponent from '../../components/chat/ChatComponent';
import { Ionicons } from '@expo/vector-icons';
import { usePage } from '../../contexts/PageContext';
import { useRepository } from '../../contexts/RepositoryContext';
import { IconSymbol } from '../../components/ui/IconSymbol';
import Sidebar from './Sidebar';
import { capitalizeFirstLetter } from '@/utils';

const SIDEBAR_WIDTH = 260;

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentPage, setCurrentPage } = usePage();
  const { refreshRepositories } = useRepository();
  const [isSidebar, setIsSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated) {
      refreshRepositories();
    }
  }, [isAuthenticated, refreshRepositories]);

  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: isSidebar ? 0 : -SIDEBAR_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isSidebar, sidebarAnim]);

  useEffect(() => {
    setActiveSection(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (!user) return;
    console.log(user.subscription);
    if (!user.subscription && pathname !== '/subscription') {
      setCurrentPage('subscription');
      router.replace('/subscription');
      return;
    }
    switch (pathname) {
      case "/main":
        setCurrentPage('home');
        break;
      case "/subscription":
        setCurrentPage('subscription');
        break;
      case "/repositoryManagement":
        setCurrentPage('repository Management');
        break;
      case "/notes":
        setCurrentPage('notes');
        break;
      case "/account":
        setCurrentPage('account');
        break;
      
      default:
        break;
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.replace('/biometric');
  };

  const handleSidebarSelect = (key: string) => {
    setIsSidebar(false);
    if(currentPage !== key) {
      setCurrentPage(key);
    }
    // You can add navigation logic here based on key
  };

  if (!isAuthenticated) {
    return <Redirect href="/biometric" />;
  }

  return (
    <Fragment>
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeButton} onPress={() => setIsSidebar(!isSidebar)}>
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>/{capitalizeFirstLetter(currentPage)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      {/* Sidebar Overlay */}
      {isSidebar && (
        <Pressable style={styles.overlay} onPress={() => setIsSidebar(false)} />
      )}
      {/* Animated Sidebar */}
      <Animated.View
        style={[
          styles.animatedSidebar,
          { transform: [{ translateX: sidebarAnim }] },
        ]}
      >
        <Sidebar active={activeSection} onSelect={handleSidebarSelect} />
      </Animated.View>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 10,
  },
  animatedSidebar: {
    position: 'absolute',
    top: 75,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: 'transparent',
    zIndex: 20,
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
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  logo: {
    width: 24,
    height: 24,
  },
  logoutButton: {
    paddingTop: 10,
  },
});