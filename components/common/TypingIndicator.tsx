import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface TypingIndicatorProps {
  isVisible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  const { connectionStatus } = useWebSocket();
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
    };

    let animation: Animated.CompositeAnimation | null = null;

    if (isVisible && connectionStatus === 'connected') {
      animation = Animated.loop(
        Animated.parallel([
          animateDot(dot1Opacity, 0),
          animateDot(dot2Opacity, 200),
          animateDot(dot3Opacity, 400),
        ])
      );
      animation.start();
    } else {
      dot1Opacity.setValue(0);
      dot2Opacity.setValue(0);
      dot3Opacity.setValue(0);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity, isVisible, connectionStatus]);

  if (!isVisible || connectionStatus !== 'connected') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 3,
  },
});

export default TypingIndicator;