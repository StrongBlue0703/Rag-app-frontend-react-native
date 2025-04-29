import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { FileMetadata, RNFile, UploadConfig } from '../interfaces/files';
import FileAPI from '../api/fileApi';
import { AxiosProgressEvent } from 'axios';
import { useFileUpload } from '../contexts/FileUploadProgressContext'; // Import the context hook

interface FileManagementProps {
  phoneNumber: string;
  repositoryName: string;
  repositoryId: number;
  onBack: () => void;
}

const FileManagement: React.FC<FileManagementProps> = ({ 
  phoneNumber, 
  repositoryName, 
  repositoryId, 
  onBack 
}) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelTokenSource = useRef<ReturnType<typeof FileAPI.getCancelTokenSource> | null>(null);

  // Use the global upload context
  const { 
    uploadProgress, 
    isUploading, 
    setUploadProgress, 
    setIsUploading 
  } = useFileUpload();

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fileList = await FileAPI.listFiles(repositoryId);
      setFiles(fileList.files);
    } catch (error) {
      setError('Failed to load files. Please try again.');
      console.log('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  }, [repositoryId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
        multiple: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Use the global state setters
        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        cancelTokenSource.current = FileAPI.getCancelTokenSource();

        const rnFiles: RNFile[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream'
        }));

        const uploadConfig: UploadConfig = {
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            // Update global progress state
            setUploadProgress(percentCompleted);
          },
          cancelToken: cancelTokenSource.current.token
        };

        await FileAPI.uploadFiles(repositoryId, rnFiles, uploadConfig);

        Alert.alert('Success', `${result.assets.length} file(s) uploaded successfully`);
        loadFiles();
      }
    } catch (error: any) {
      if (error.message === 'canceled') {
        setError('Upload canceled');
      } else {
        setError('Failed to upload files. Please try again.');
        console.log('Error uploading files:', error);
      }
    } finally {
      // Reset global upload state
      setIsUploading(false);
      setUploadProgress(0);
      cancelTokenSource.current = null;
    }
  }, [repositoryId, loadFiles, setIsUploading, setUploadProgress]);

  const handleCancelUpload = useCallback(() => {
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('Upload canceled by user');
    }
  }, []);

  const handleDeleteFile = useCallback(async (filename: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete the file "${filename}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            setError(null);
            try {
              await FileAPI.deleteFile(repositoryId, filename);
              Alert.alert('Success', `File ${filename} deleted successfully`);
              loadFiles();
            } catch (error) {
              setError('Failed to delete file. Please try again.');
              console.log('Error deleting file:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [repositoryId, loadFiles]);

  const renderFileItem = useCallback(({ item }: { item: FileMetadata }) => (
    <View style={styles.fileItem}>
      <Text style={styles.fileName}>{item.original_filename}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteFile(item.filename)}
        accessibilityRole="button"
        accessibilityLabel={`Delete file ${item.original_filename}`}
      >
        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  ), [handleDeleteFile]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Files in {repositoryName}</Text>
      </View>
      {isUploading && (
        <View style={styles.uploadProgress}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.uploadProgressText}>
            Uploading... {uploadProgress.toFixed(0)}%
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelUpload}
            accessibilityRole="button"
            accessibilityLabel="Cancel upload"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={files}
          renderItem={renderFileItem}
          keyExtractor={(item) => item.filename}
          refreshing={isLoading}
          onRefresh={loadFiles}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No files in this repository</Text>
          }
        />
      )}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUpload}
        disabled={isUploading}
        accessibilityRole="button"
        accessibilityLabel="Upload files"
      >
        <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
        <Text style={styles.uploadButtonText}>Upload Files</Text>
      </TouchableOpacity>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.clearErrorText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  fileName: {
    fontSize: 16,
    color: '#2E3A59',
  },
  deleteButton: {
    padding: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#8F9BB3',
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E5F2FF',
  },
  uploadProgressText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
  },
  cancelButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    flex: 1,
  },
  clearErrorText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FileManagement;