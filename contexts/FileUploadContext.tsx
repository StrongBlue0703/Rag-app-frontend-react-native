import React, { createContext, useReducer, useContext, ReactNode, useCallback, useRef, useMemo } from 'react';
import FileAPI from '../api/fileApi';
import { getConfig } from '../api/config';
import { FileMetadata, FileList } from '../interfaces/files';
import { RepositoryError } from '../interfaces/repository';

interface FileUploadState {
  isLoading: boolean;
  error: string | null;
  files: FileMetadata[];
  currentRepository: number | null;
}

type FileUploadAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILES'; payload: FileMetadata[] }
  | { type: 'ADD_FILES'; payload: FileMetadata[] }
  | { type: 'REMOVE_FILE'; payload: string }
  | { type: 'SET_REPOSITORY'; payload: number };

const initialState: FileUploadState = {
  isLoading: false,
  error: null,
  files: [],
  currentRepository: null,
};

const fileUploadReducer = (state: FileUploadState, action: FileUploadAction): FileUploadState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILES':
      return { ...state, files: action.payload };
    case 'ADD_FILES':
      return { ...state, files: [...state.files, ...action.payload] };
    case 'REMOVE_FILE':
      return {
        ...state,
        files: state.files.filter((file) => file.filename !== action.payload),
      };
    case 'SET_REPOSITORY':
      if (state.currentRepository === action.payload) {
        return state;
      }
      return { ...state, currentRepository: action.payload, files: [] };
    default:
      return state;
  }
};

interface FileUploadContextValue extends FileUploadState {
  uploadFiles: (files: File[], phoneNumber: string, signal: AbortSignal) => Promise<void>;
  deleteFile: (filename: string, phoneNumber: string) => Promise<void>;
  listFiles: (phoneNumber: string) => Promise<void>;
  setRepository: (repository: number) => void;
  clearError: () => void;
  getCurrentRepository: () => number | null;
}

const FileUploadContext = createContext<FileUploadContextValue | undefined>(undefined);

interface FileUploadProviderProps {
  children: ReactNode;
}

export const FileUploadProvider: React.FC<FileUploadProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(fileUploadReducer, initialState);
  const config = useMemo(() => getConfig(), []);
  const operationInProgress = useRef(false);

  const setRepository = useCallback((repository: number) => {
    dispatch({ type: 'SET_REPOSITORY', payload: repository });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const getCurrentRepository = useCallback(() => {
    return state.currentRepository;
  }, [state.currentRepository]);

  const uploadFiles = useCallback(async (files: File[], phoneNumber: string, signal: AbortSignal) => {
    if (!state.currentRepository) {
      throw new RepositoryError('Please select a repository before uploading files');
    }

    if (operationInProgress.current) return;
    operationInProgress.current = true;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Validate file size and type
      for (const file of files) {
        if (file.size > config.maxFileSize) {
          throw new Error(`File ${file.name} exceeds maximum allowed size of ${config.maxFileSize / 1024 / 1024}MB`);
        }
        if (!config.allowedFileTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} is not allowed for ${file.name}`);
        }
      }

      const response = await FileAPI.uploadFiles(phoneNumber, state.currentRepository, files);

      dispatch({ type: 'ADD_FILES', payload: response.file_metadata });
    } catch (error) {
      if (error instanceof RepositoryError) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } else if (error instanceof Error) {
        dispatch({ type: 'SET_ERROR', payload: `Failed to upload files: ${error.message}` });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'An unknown error occurred while uploading the files' });
      }
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      operationInProgress.current = false;
    }
  }, [state.currentRepository, config.maxFileSize, config.allowedFileTypes]);

  const deleteFile = useCallback(async (filename: string, phoneNumber: string) => {
    if (!state.currentRepository) {
      throw new RepositoryError('Please select a repository before deleting files');
    }

    if (operationInProgress.current) return;
    operationInProgress.current = true;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await FileAPI.deleteFile(phoneNumber, state.currentRepository, filename);

      dispatch({ type: 'REMOVE_FILE', payload: filename });
    } catch (error) {
      if (error instanceof RepositoryError) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } else if (error instanceof Error) {
        dispatch({ type: 'SET_ERROR', payload: `Failed to delete file: ${error.message}` });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'An unknown error occurred while deleting the file' });
      }
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      operationInProgress.current = false;
    }
  }, [state.currentRepository]);

  const listFiles = useCallback(async (phoneNumber: string) => {
    if (!state.currentRepository) {
      throw new RepositoryError('Please select a repository before listing files');
    }

    if (operationInProgress.current) return;
    operationInProgress.current = true;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await FileAPI.listFiles(state.currentRepository);

      dispatch({ type: 'SET_FILES', payload: response.files });
    } catch (error) {
      if (error instanceof RepositoryError) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } else if (error instanceof Error) {
        dispatch({ type: 'SET_ERROR', payload: `Failed to list files: ${error.message}` });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'An unknown error occurred while listing files' });
      }
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      operationInProgress.current = false;
    }
  }, [state.currentRepository]);

  const value: FileUploadContextValue = {
    ...state,
    uploadFiles,
    deleteFile,
    listFiles,
    setRepository,
    clearError,
    getCurrentRepository,
  };

  return (
    <FileUploadContext.Provider value={value}>
      {children}
    </FileUploadContext.Provider>
  );
};

export const useFileUpload = (): FileUploadContextValue => {
  const context = useContext(FileUploadContext);
  if (context === undefined) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  return context;
};