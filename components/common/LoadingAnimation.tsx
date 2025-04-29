import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface LoadingAnimationProps {
  size?: number;
  color?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ size = 40, color = '#007AFF' }) => {
  const spinValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderColor: color,
            borderWidth: size / 10,
            borderRadius: size / 2,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default LoadingAnimation;