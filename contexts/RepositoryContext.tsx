import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';
import RepositoryService from '../services/repositoryService';
import { getConfig } from '../api/config';
import { Repository } from '../interfaces/repository';

interface RepositoryState {
  repositories: Repository[];
  currentRepository: Repository | null;
  isLoading: boolean;
  error: string | null;
}

interface RepositoryContextType extends RepositoryState {
  setCurrentRepository: (repo: Repository | null) => void;
  createRepository: (name: string) => Promise<void>;
  updateRepository: (currentName: string, newName: string) => Promise<void>;
  deleteRepository: (name: string) => Promise<void>;
  refreshRepositories: () => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEYS = {
  REPOSITORIES: 'repositories',
  CURRENT_REPOSITORY: 'currentRepository',
};

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);
const repositoryService = new RepositoryService(getConfig().baseUrl);

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<RepositoryState>({
    repositories: [],
    currentRepository: null,
    isLoading: false,
    error: null,
  });

  const isInitialized = useRef(false);
  const isUpdating = useRef(false);
  const pendingOperation = useRef<(() => Promise<void>) | null>(null);

  // Load initial state from storage
  useEffect(() => {
    const loadStoredData = async () => {
      if (isInitialized.current) return;
      
      try {
        const [storedRepositories, storedCurrentRepo] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.REPOSITORIES),
          SecureStore.getItemAsync(STORAGE_KEYS.CURRENT_REPOSITORY),
        ]);

        if (storedRepositories || storedCurrentRepo) {
          setState(prev => ({
            ...prev,
            repositories: storedRepositories ? JSON.parse(storedRepositories) : [],
            currentRepository: storedCurrentRepo ? JSON.parse(storedCurrentRepo) : null,
          }));
        }
        isInitialized.current = true;
      } catch (error) {
        console.log('Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, []);

  // Save state changes to storage with debounce
  useEffect(() => {
    if (!isInitialized.current || isUpdating.current) return;

    const saveToStorage = async () => {
      try {
        isUpdating.current = true;
        await Promise.all([
          SecureStore.setItemAsync(STORAGE_KEYS.REPOSITORIES, JSON.stringify(state.repositories)),
          SecureStore.setItemAsync(STORAGE_KEYS.CURRENT_REPOSITORY, JSON.stringify(state.currentRepository)),
        ]);
      } catch (error) {
        console.log('Error saving to storage:', error);
      } finally {
        isUpdating.current = false;
        if (pendingOperation.current) {
          const operation = pendingOperation.current;
          pendingOperation.current = null;
          operation();
        }
      }
    };

    const timeoutId = setTimeout(saveToStorage, 1000);
    return () => clearTimeout(timeoutId);
  }, [state.repositories, state.currentRepository]);

  const setCurrentRepository = useCallback((repo: Repository | null) => {
    if (isUpdating.current) {
      pendingOperation.current = () => Promise.resolve(
        setState(prev => ({ ...prev, currentRepository: repo }))
      );
      return;
    }
    setState(prev => {
      if (prev.currentRepository?.id === repo?.id) return prev;
      return { ...prev, currentRepository: repo };
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshRepositories = useCallback(async () => {
    if (!user?.phone_number || isUpdating.current) {
      if (isUpdating.current) {
        pendingOperation.current = refreshRepositories;
      }
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const repositories = await repositoryService.listRepositories({
        phone_number: user.phone_number
      });
      console.log(repositories)
      setState(prev => ({ ...prev, repositories }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch repositories'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.phone_number]);

  const createRepository = useCallback(async (name: string) => {
    if (!user?.phone_number || isUpdating.current) {
      if (isUpdating.current) {
        pendingOperation.current = () => createRepository(name);
      }
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await repositoryService.createRepository({
        phone_number: user.phone_number,
        name
      });
      await refreshRepositories();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create repository'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.phone_number, refreshRepositories]);

  const updateRepository = useCallback(async (currentName: string, newName: string) => {
    if (!user?.phone_number || isUpdating.current) {
      if (isUpdating.current) {
        pendingOperation.current = () => updateRepository(currentName, newName);
      }
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await repositoryService.updateRepository({
        phone_number: user.phone_number,
        repository_name: currentName,
        new_name: newName
      });
      await refreshRepositories();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update repository'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.phone_number, refreshRepositories]);

  const deleteRepository = useCallback(async (name: string) => {
    if (!user?.phone_number || isUpdating.current) {
      if (isUpdating.current) {
        pendingOperation.current = () => deleteRepository(name);
      }
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await repositoryService.deleteRepository({
        phone_number: user.phone_number,
        repository_name: name
      });
      if (state.currentRepository?.name === name) {
        setCurrentRepository(null);
      }
      await refreshRepositories();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete repository'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.phone_number, refreshRepositories, state.currentRepository?.name, setCurrentRepository]);

  // Initial load of repositories
  useEffect(() => {
    if (!isInitialized.current || !user?.phone_number || isUpdating.current) return;

    refreshRepositories();
  }, [user?.phone_number]); // Removed refreshRepositories from deps to avoid unnecessary refreshes

  const value: RepositoryContextType = {
    ...state,
    setCurrentRepository,
    createRepository,
    updateRepository,
    deleteRepository,
    refreshRepositories,
    clearError,
  };

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return context;
}