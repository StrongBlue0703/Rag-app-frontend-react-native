import { useState, useCallback, useRef } from 'react';
import { useFileUpload } from '../contexts/FileUploadContext';
import { FileMetadata } from '../interfaces/files';
import { RepositoryError } from '../interfaces/repository';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseFileUploaderReturn {
  files: FileMetadata[];
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  error: string | null;
  uploadFiles: (files: File[], phoneNumber: string) => Promise<void>;
  deleteFile: (filename: string, phoneNumber: string) => Promise<void>;
  refreshFiles: (phoneNumber: string) => Promise<void>;
  clearError: () => void;
  setCurrentRepository: (repositoryId: number) => void;
}

export const useFileUploader = (): UseFileUploaderReturn => {
  const {
    files,
    isLoading,
    error,
    uploadFiles: contextUploadFiles,
    deleteFile: contextDeleteFile,
    listFiles,
    clearError,
    getCurrentRepository,
    setCurrentRepository: contextSetCurrentRepository
  } = useFileUpload();

  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  const cleanup = () => {
    isMounted.current = false;
  };

  const uploadFiles = useCallback(
    async (files: File[], phoneNumber: string) => {
      const currentRepository = getCurrentRepository();
      if (!currentRepository) {
        throw new RepositoryError('Please select a repository before uploading files');
      }

      const totalSize = files.reduce((acc, file) => acc + file.size, 0);

      try {
        setUploadProgress({ loaded: 0, total: totalSize, percentage: 0 });

        const abortController = new AbortController();
        await contextUploadFiles(files, phoneNumber, abortController.signal);
        
        if (isMounted.current) {
          setUploadProgress({
            loaded: totalSize,
            total: totalSize,
            percentage: 100
          });
        }
      } catch (error) {
        if (error instanceof RepositoryError) {
          throw error;
        } else if (error instanceof Error) {
          throw new RepositoryError(`Failed to upload files: ${error.message}`);
        } else {
          throw new RepositoryError('An unknown error occurred while uploading files');
        }
      } finally {
        if (isMounted.current) {
          setUploadProgress(null);
        }
      }
    },
    [contextUploadFiles, getCurrentRepository]
  );

  const deleteFile = useCallback(
    async (filename: string, phoneNumber: string) => {
      try {
        await contextDeleteFile(filename, phoneNumber);
      } catch (error) {
        if (error instanceof Error) {
          throw new RepositoryError(`Failed to delete file: ${error.message}`);
        } else {
          throw new RepositoryError('An unknown error occurred while deleting the file');
        }
      }
    },
    [contextDeleteFile]
  );

  const refreshFiles = useCallback(
    async (phoneNumber: string) => {
      try {
        await listFiles(phoneNumber);
      } catch (error) {
        if (error instanceof Error) {
          throw new RepositoryError(`Failed to refresh files: ${error.message}`);
        } else {
          throw new RepositoryError('An unknown error occurred while refreshing files');
        }
      }
    },
    [listFiles]
  );

  const setCurrentRepository = useCallback((repositoryId: number) => {
    contextSetCurrentRepository(repositoryId);
  }, [contextSetCurrentRepository]);

  return {
    files,
    isUploading: isLoading,
    uploadProgress,
    error,
    uploadFiles,
    deleteFile,
    refreshFiles,
    clearError,
    setCurrentRepository
  };
};