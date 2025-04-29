import React, { useCallback, useRef, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useFileUploader } from '../../hooks/useFileUploader';
import { useFileUpload } from '../../contexts/FileUploadContext';
import { ThemedText } from '../common/ThemedText';
import { ThemedView } from '../common/ThemedView';
import { RepositoryError } from '../../interfaces/repository';

interface FileUploadProps {
  phoneNumber: string;
  repository_id: number | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ phoneNumber, repository_id }) => {
  const {
    files,
    isUploading,
    uploadProgress,
    error,
    uploadFiles,
    deleteFile,
    refreshFiles,
    clearError,
    setCurrentRepository,
  } = useFileUploader();

  const initialLoadDone = useRef(false);
  const currentRepositoryRef = useRef<number | null>(null);
  const isRefreshing = useRef(false);

  // Handle repository changes
  useEffect(() => {
    const handleRepositoryChange = async () => {
      if (!repository_id || repository_id === currentRepositoryRef.current) {
        return;
      }

      try {
        currentRepositoryRef.current = repository_id;
        setCurrentRepository(repository_id);

        // Only refresh files on initial load or when repository actually changes
        if (!initialLoadDone.current && !isRefreshing.current) {
          initialLoadDone.current = true;
          isRefreshing.current = true;
          await refreshFiles(phoneNumber);
          isRefreshing.current = false;
        }
      } catch (err) {
        if (err instanceof Error) {
          Alert.alert('Error', err.message);
        }
      }
    };

    handleRepositoryChange();
  }, [repository_id, phoneNumber, setCurrentRepository, refreshFiles]);

  const pickDocument = useCallback(async () => {
    if (!repository_id) {
      Alert.alert('Error', 'Please select a repository before uploading files');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const selectedFiles = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType,
      }));

      const filesToUpload = selectedFiles.map(file => {
        return {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as unknown as File;
      });

      await uploadFiles(filesToUpload, phoneNumber);
      
      // Only refresh if we're not already refreshing
      if (!isRefreshing.current) {
        isRefreshing.current = true;
        await refreshFiles(phoneNumber);
        isRefreshing.current = false;
      }
    } catch (err) {
      if (err instanceof RepositoryError) {
        Alert.alert('Error', err.message);
      } else if (err instanceof Error) {
        Alert.alert('Error', `Failed to upload files: ${err.message}`);
      } else {
        Alert.alert('Error', 'An unknown error occurred while uploading files');
      }
    }
  }, [repository_id, uploadFiles, phoneNumber, refreshFiles]);

  const handleDelete = useCallback(async (filename: string) => {
    if (!repository_id) {
      Alert.alert('Error', 'Please select a repository before deleting files');
      return;
    }

    try {
      await deleteFile(filename, phoneNumber);
      
      // Only refresh if we're not already refreshing
      if (!isRefreshing.current) {
        isRefreshing.current = true;
        await refreshFiles(phoneNumber);
        isRefreshing.current = false;
      }
    } catch (err) {
      if (err instanceof RepositoryError) {
        Alert.alert('Error', err.message);
      } else if (err instanceof Error) {
        Alert.alert('Error', `Failed to delete file: ${err.message}`);
      } else {
        Alert.alert('Error', 'An unknown error occurred while deleting the file');
      }
    }
  }, [repository_id, deleteFile, phoneNumber, refreshFiles]);

  if (!repository_id) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.messageContainer}>
          <ThemedText style={styles.messageText}>
            Please select a repository before uploading files
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

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

      <TouchableOpacity
        onPress={pickDocument}
        disabled={isUploading}
        style={[
          styles.uploadButton,
          isUploading && styles.uploadButtonDisabled
        ]}
      >
        <ThemedText style={styles.uploadButtonText}>
          {isUploading ? 'Uploading...' : 'Select Files'}
        </ThemedText>
      </TouchableOpacity>

      {isUploading && uploadProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${uploadProgress.percentage}%` },
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            {uploadProgress.percentage}% Complete
          </ThemedText>
        </View>
      )}

      <ScrollView style={styles.fileList}>
        {files.map((file) => (
          <View key={file.filename} style={styles.fileItem}>
            <View style={styles.fileInfo}>
              <ThemedText style={styles.fileName}>{file.original_filename}</ThemedText>
              <ThemedText style={styles.fileSize}>
                {(file.file_size / 1024).toFixed(2)} KB
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(file.filename)}
              style={styles.deleteButton}
            >
              <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  uploadButton: {
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonDisabled: {
    backgroundColor: '#90caf9',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196f3',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#757575',
  },
  fileList: {
    flex: 1,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#757575',
  },
  deleteButton: {
    backgroundColor: '#ef5350',
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
});

export default FileUpload;