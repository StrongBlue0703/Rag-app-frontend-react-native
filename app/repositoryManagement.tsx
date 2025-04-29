import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import RepositoryAPI from '../api/repositoryApi';
import { Repository, RepositoryError } from '../interfaces/repository';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '@/config/api';
import ErrorBoundary from '@/components/ErrorBoundary';
import FileManagement from '@/components/FileManagement';

const repositoryApi = new RepositoryAPI();
const { width } = Dimensions.get('window');

function RepositoryManagementScreen() {
  const { getToken, isAuthenticated, authenticate } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [user, setUser] = useState<{ id: number; phone_number: string } | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [repoModalVisible, setRepoModalVisible] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [refreshingRepos, setRefreshingRepos] = useState(false);
  const [creatingRepo, setCreatingRepo] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchUser = async () => {
    const token = await getToken();
    if (!token) {
      if (!isAuthenticated) {
        try {
          await authenticate();
        } catch (error) {
          console.error('Authentication failed:', error);
          Alert.alert('Error', 'Failed to authenticate. Please try again.');
          setUserLoading(false);
          return;
        }
      } else {
        Alert.alert('Error', 'User token is missing. Please log in again.');
        setUserLoading(false);
        return;
      }
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/get_user`, {
        params: { token }
      });
      setUser(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching user info:', error.response?.data || error.message);
        if (error.response?.status === 422) {
          Alert.alert('Error', 'Invalid token format. Please log in again.');
        } else if (error.response?.status === 401) {
          Alert.alert('Error', 'Authentication failed. Please log in again.');
        } else {
          Alert.alert('Error', 'Failed to fetch user info. Please try again.');
        }
      } else {
        console.error('Error fetching user info:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setUserLoading(false);
    }
  };

  const loadRepositories = useCallback(async (showRefreshing = false) => {
    const token = await getToken();

    if (!token) {
      Alert.alert('Error', 'Authentication token is missing. Please log in again.');
      return;
    }

    if (showRefreshing) {
      setRefreshingRepos(true);
    } else {
      setLoading(true);
    }

    try {
      const repos = await repositoryApi.listRepositories(token);
      setRepositories(repos);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      if (error instanceof RepositoryError) {
        Alert.alert('Error', error.message);
      } else {
        console.error('Error loading repositories:', error);
        Alert.alert('Error', 'Failed to load repositories. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshingRepos(false);
    }
  }, [getToken, fadeAnim]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadRepositories();
    }
  }, [user, loadRepositories]);

  const confirmCreateRepository = useCallback(async () => {
    setRepoModalVisible(false);
    const token = await getToken();
    if (!token) {
      Alert.alert('Error', 'Authentication token is missing. Please log in again.');
      return;
    }
    if (!newRepoName.trim()) {
      Alert.alert('Error', 'Repository name cannot be empty.');
      return;
    }
    setCreatingRepo(true);
    try {
      const newRepo = await repositoryApi.createRepository({name: newRepoName}, token);
      setRepositories((prevRepos) => [...prevRepos, newRepo]);
      Alert.alert('Success', `Repository "${newRepoName}" created successfully`);
      setNewRepoName('');
    } catch (error) {
      if (error instanceof RepositoryError) {
        Alert.alert('Error', error.message);
      } else {
        console.error('Error creating repository:', error);
        Alert.alert('Error', 'Failed to create repository. Please try again.');
      }
    } finally {
      setCreatingRepo(false);
    }
  }, [newRepoName, getToken]);

  const cancelCreateRepository = useCallback(() => {
    setRepoModalVisible(false);
    setNewRepoName('');
  }, []);

  const handleSelectRepository = useCallback((repository: Repository) => {
    setSelectedRepository(repository);
  }, []);

  const handleBackFromFileManagement = useCallback(() => {
    setSelectedRepository(null);
  }, []);

  const renderRepositoryItem = useCallback(({ item }: { item: Repository }) => (
    <TouchableOpacity
      style={styles.repositoryItem}
      onPress={() => handleSelectRepository(item)}
      accessibilityRole="button"
      accessibilityLabel={`Select repository ${item.name}`}
    >
      <Ionicons name="folder-outline" size={24} color="#4A90E2" style={styles.folderIcon} />
      <Text style={styles.repositoryName}>{item.name}</Text>
    </TouchableOpacity>
  ), [handleSelectRepository]);

  if (userLoading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={repoModalVisible}
        onRequestClose={() => setRepoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create Repository</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter repository name"
              value={newRepoName}
              onChangeText={setNewRepoName}
              accessibilityLabel="Enter repository name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelCreateRepository}
                accessibilityRole="button"
                accessibilityLabel="Cancel creating repository"
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmCreateRepository}
                accessibilityRole="button"
                accessibilityLabel="Confirm creating repository"
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Create</Text>
              </TouchableOpacity>
            </View>
            {creatingRepo && <ActivityIndicator size="small" color="#4A90E2" />}
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.title}>Repository Management</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
      ) : selectedRepository ? (
        <FileManagement
          phoneNumber={user?.phone_number || ''}
          repositoryName={selectedRepository.name}
          repositoryId={selectedRepository.id}
          onBack={handleBackFromFileManagement}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.repositoryList}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Repositories</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => loadRepositories(true)}
                accessibilityRole="button"
                accessibilityLabel="Refresh repositories"
              >
                <Ionicons name="refresh" size={24} color="#4A90E2" />
              </TouchableOpacity>
            </View>
            <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
              <FlatList
                data={repositories}
                renderItem={renderRepositoryItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.list}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshingRepos}
                    onRefresh={() => loadRepositories(true)}
                    accessibilityLabel="Pull to refresh repositories"
                    colors={['#4A90E2']}
                  />
                }
              />
            </Animated.View>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setRepoModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Create new repository"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" style={styles.createButtonIcon} />
            <Text style={styles.createButtonText}>Create New Repository</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginLeft: 15,
  },
  backButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  repositoryList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  repositoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  folderIcon: {
    marginRight: 10,
  },
  repositoryName: {
    fontSize: 16,
    color: '#2E3A59',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
  createButtonIcon: {
    marginRight: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F5F7FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  refreshButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#2E3A59',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F7FA',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    marginLeft: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});

export default function RepositoryManagementScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <RepositoryManagementScreen />
    </ErrorBoundary>
  );
}