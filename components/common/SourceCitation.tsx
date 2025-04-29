import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SourceCitationProps {
  title: string;
  url: string;
}

const SourceCitation: React.FC<SourceCitationProps> = ({ title, url }) => {
  const handlePress = async () => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Don't know how to open this URL: " + url);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Ionicons name="document-text-outline" size={16} color="#007AFF" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <Text style={styles.url} numberOfLines={1} ellipsizeMode="tail">
          {url}
        </Text>
      </View>
      <Ionicons name="open-outline" size={16} color="#007AFF" style={styles.openIcon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  url: {
    fontSize: 12,
    color: '#666',
  },
  openIcon: {
    marginLeft: 8,
  },
});

export default SourceCitation;