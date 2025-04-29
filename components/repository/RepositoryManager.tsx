import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRepository } from '@/contexts/RepositoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '../common/ThemedView';
import { ThemedText } from '../common/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Repository } from '@/interfaces/repository';

export function RepositoryManager() {
  const { isAuthenticated } = useAuth();
  const {
    repositories,
    currentRepository,
    isLoading,
    error,
    createRepository,
    updateRepository,
    deleteRepository,
    setCurrentRepository,
    clearError,
    refreshRepositories,
  } = useRepository();

  const [newRepoName, setNewRepoName] = useState('');
  const [editingRepo, setEditingRepo] = useState<Repository | null>(null);
  const [editName, setEditName] = useState('');
  const colorScheme = useColorScheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isAuthenticated) {
      refreshRepositories();
    }
  }, [isAuthenticated, refreshRepositories]);

  useEffect(() => {
    if (editingRepo) {
      inputRef.current?.focus();
    }
  }, [editingRepo]);

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.messageContainer}>
          <ThemedText style={styles.messageText}>
            Please authenticate to access your repositories
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const validateRepositoryName = (name: string) => {
    if (!name.trim()) {
      throw new Error('Repository name cannot be empty');
    }
    if (name.length < 3) {
      throw new Error('Repository name must be at least 3 characters long');
    }
    if (name.length > 50) {
      throw new Error('Repository name cannot exceed 50 characters');
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      throw new Error('Repository name can only contain letters, numbers, hyphens, and underscores');
    }
    return true;
  };

  const handleCreateRepository = useCallback(async () => {
    try {
      validateRepositoryName(newRepoName);
      await createRepository(newRepoName.trim());
      setNewRepoName('');
      Alert.alert('Success', 'Repository created successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create repository');
    }
  }, [newRepoName, createRepository]);

  const handleUpdateRepository = useCallback(async () => {
    if (!editingRepo) return;

    try {
      validateRepositoryName(editName);
      await updateRepository(editingRepo.name, editName.trim());
      setEditingRepo(null);
      setEditName('');
      Alert.alert('Success', 'Repository updated successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update repository');
    }
  }, [editingRepo, editName, updateRepository]);

  const handleDeleteRepository = useCallback(
    (repository: Repository) => {
      Alert.alert(
        'Delete Repository',
        `Are you sure you want to delete "${repository.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteRepository(repository.name);
                Alert.alert('Success', 'Repository deleted successfully');
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete repository');
              }
            },
          },
        ]
      );
    },
    [deleteRepository]
  );

  const startEditing = useCallback((repository: Repository) => {
    setEditingRepo(repository);
    setEditName(repository.name);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingRepo(null);
    setEditName('');
  }, []);

  return (
    <ThemedView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity onPress={clearError} style={styles.clearErrorButton}>
            <ThemedText style={styles.clearErrorText}>Dismiss</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.createContainer}>
        <TextInput
          style={[
            styles.input,
            { color: colorScheme === 'dark' ? '#fff' : '#000' },
            { backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5' },
          ]}
          value={newRepoName}
          onChangeText={setNewRepoName}
          placeholder="New repository name"
          placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
          onSubmitEditing={handleCreateRepository}
        />
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreateRepository}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>Create</ThemedText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2196f3" style={styles.loader} />
      ) : repositories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            No repositories found. Create one to get started!
          </ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {repositories.map((repo) => (
            <View key={repo.id} style={styles.repositoryItem}>
              {editingRepo?.id === repo.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    ref={inputRef}
                    style={[
                      styles.input,
                      { color: colorScheme === 'dark' ? '#fff' : '#000' },
                      { backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5' },
                    ]}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Repository name"
                    placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
                    onSubmitEditing={handleUpdateRepository}
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton]}
                      onPress={handleUpdateRepository}
                    >
                      <ThemedText style={styles.buttonText}>Save</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={cancelEditing}
                    >
                      <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.repositoryContent}>
                  <TouchableOpacity
                    style={styles.nameContainer}
                    onPress={() => setCurrentRepository(repo)}
                  >
                    <ThemedText
                      style={[
                        styles.repositoryName,
                        currentRepository?.id === repo.id && styles.selectedRepository,
                      ]}
                    >
                      {repo.name}
                    </ThemedText>
                  </TouchableOpacity>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.button, styles.editButton]}
                      onPress={() => startEditing(repo)}
                    >
                      <ThemedText style={styles.buttonText}>Edit</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.deleteButton]}
                      onPress={() => handleDeleteRepository(repo)}
                    >
                      <ThemedText style={styles.buttonText}>Delete</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  createContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: '#2196f3',
  },
  editButton: {
    backgroundColor: '#4caf50',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#4caf50',
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  repositoryItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  repositoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  nameContainer: {
    flex: 1,
    paddingRight: 8,
  },
  repositoryName: {
    fontSize: 16,
  },
  selectedRepository: {
    fontWeight: 'bold',
    color: '#2196f3',
  },
  actions: {
    flexDirection: 'row',
  },
  editContainer: {
    padding: 12,
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    flex: 1,
  },
  clearErrorButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearErrorText: {
    color: '#c62828',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});