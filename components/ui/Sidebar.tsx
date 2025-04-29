import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const MENU = [
  { key: 'home', label: 'Home', icon: 'layers-outline' },
  { key: 'account', label: 'Account', icon: 'person-outline' },
  { key: 'notes', label: 'Notes', icon: 'share-social-outline' },
  { key: 'repositories', label: 'Repositories', icon: 'git-network-outline' },
];

export default function Sidebar({ active, onSelect }: { active: string; onSelect: (key: string) => void }) {

  const handleMenuPress = (key: string) => {
    onSelect(key);
    switch (key) {
      case "home":
        router.push('/main');
        break;
      case "account":
        router.push('/account');
        break;
      case "notes":
        router.push('/notes');
        break;
      case "repositories":
        router.push('/repositoryManagement');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.sidebar}>
      {MENU.map(item => (
        <TouchableOpacity
          key={item.key}
          style={[styles.button, active === item.key && styles.activeButton]}
          onPress={() => handleMenuPress(item.key)}
        >
          <Ionicons
            name={item.icon as any}
            size={24}
            color={active === item.key ? '#fff' : '#fff'}
            style={styles.icon}
          />
          <Text style={[styles.label, active === item.key && styles.activeLabel]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    marginTop: 0,
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    height: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    marginBottom: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  activeButton: {
    backgroundColor: '#5B36D6',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  activeLabel: {
    color: '#fff',
  },
});
