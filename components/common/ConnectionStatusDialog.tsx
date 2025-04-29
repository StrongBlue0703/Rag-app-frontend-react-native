import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useWebSocket } from '@/contexts/WebSocketContext';

const ConnectionStatusDialog: React.FC = () => {
  const { connectionStatus, connectionError, initializeWebSockets } = useWebSocket();
  const [showStatus, setShowStatus] = useState(false);
  
  // Create animation values only once using useMemo
  const statusOpacity = useMemo(() => new Animated.Value(0), []);
  const dotOpacity = useMemo(() => new Animated.Value(0), []);
  
  // Animation configurations - memoized to prevent recreating objects
  const fadeInConfig = useMemo(() => ({
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }), []);
  
  const fadeOutConfig = useMemo(() => ({
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  }), []);

  // Handle status visibility animation
  useEffect(() => {
    let fadeOutTimeout: NodeJS.Timeout | null = null;
    
    if (connectionStatus !== 'connected') {
      setShowStatus(true);
      // Fade in animation
      Animated.timing(statusOpacity, fadeInConfig).start();
    } else {
      // Only start fade out after delay
      fadeOutTimeout = setTimeout(() => {
        Animated.timing(statusOpacity, fadeOutConfig).start(() => {
          setShowStatus(false);
        });
      }, 2000);
    }
    
    // Clean up timeout to prevent memory leaks
    return () => {
      if (fadeOutTimeout) clearTimeout(fadeOutTimeout);
    };
  }, [connectionStatus, statusOpacity, fadeInConfig, fadeOutConfig]);

  // Handle connecting animation (blinking dot)
  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;
    
    if (connectionStatus === 'connecting') {
      // Create and start the animation loop
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      
      animationLoop.start();
    } else {
      // Reset the dot opacity
      dotOpacity.setValue(0);
    }
    
    // Clean up the animation when component unmounts or status changes
    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [connectionStatus, dotOpacity]);

  // Memoize status message to prevent recalculation
  const statusMessage = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to server';
      case 'disconnected':
        return 'Disconnected from server';
      case 'connecting':
        return 'Connecting to server';
      case 'error':
        if (connectionError && connectionError.includes('Auth WebSocket error')) {
          return 'Connection error occurred';
        }
        return connectionError || 'An error occurred';
      default:
        return 'Unknown connection status';
    }
  }, [connectionStatus, connectionError]);

  // Memoize status color to prevent recalculation
  const statusColor = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return '#4CAF50';
      case 'disconnected':
        return '#FFA000';
      case 'connecting':
        return '#2196F3';
      case 'error':
        return '#F44336';
      default:
        return '#757575';
    }
  }, [connectionStatus]);
  
  // Retry connection handler
  const handleRetry = useCallback(() => {
    if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      initializeWebSockets();
    }
  }, [connectionStatus, initializeWebSockets]);

  // Early return for improved performance
  if (!showStatus) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: statusOpacity }]}>
      <View style={[styles.statusBar, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusMessage}</Text>
        {connectionStatus === 'connecting' && (
          <Animated.Text style={[styles.dot, { opacity: dotOpacity }]}>
            ...
          </Animated.Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dot: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// Use memo to prevent unnecessary re-renders
export default memo(ConnectionStatusDialog);