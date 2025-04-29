import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFileUpload } from '../../contexts/FileUploadProgressContext';

const GlobalUploadProgress: React.FC = () => {
  const { isUploading, uploadProgress } = useFileUpload();
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isUploading) {
      Animated.timing(animatedWidth, {
        toValue: uploadProgress,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [isUploading, uploadProgress]);

  if (!isUploading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarBackground}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { 
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }) 
            }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        Uploading... {uploadProgress.toFixed(0)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F7FA',
    padding: 10,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    marginTop: 5,
    color: '#2E3A59',
  },
});

export default GlobalUploadProgress;
