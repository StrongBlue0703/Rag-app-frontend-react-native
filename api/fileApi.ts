import * as apiClient from '../utils/apiClient';
import { FileMetadata, FileResponse, FileList, UploadConfig } from '../interfaces/files';
import { BACKEND_URL } from '../config/api';
import axios, { CancelTokenSource, CancelToken } from 'axios';
import { Platform } from 'react-native';

// Define a type for React Native file object
interface RNFile {
  uri: string;
  name: string;
  type: string;
}

class FileAPI {
  private apiPrefix: string;

  constructor() {
    this.apiPrefix = `/files`;
  }

  private getUrl(path: string): string {
    return `${this.apiPrefix}${path}`;
  }

  getCancelTokenSource(): CancelTokenSource {
    return axios.CancelToken.source();
  }

  async uploadFiles(
    repository_id: number,
    files: RNFile[],
    config?: UploadConfig
  ): Promise<FileResponse> {
    if (files.length === 0) {
      throw new Error('No files provided for upload');
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, {
        uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
        type: file.type,
        name: file.name,
      } as any);
    });

    try {
      const { data } = await apiClient.upload<FileResponse>(
        this.getUrl(`/${repository_id}/upload/`),
        formData,
        {
          onUploadProgress: config?.onUploadProgress,
          cancelToken: config?.cancelToken,
        }
      );
      return data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('File upload canceled:', error.message);
        throw new Error('File upload canceled');
      }
      if (axios.isAxiosError(error)) {
        console.error('File upload failed:', error.response?.data?.detail || error.message);
        throw new Error(`File upload failed: ${error.response?.data?.detail || error.message}`);
      }
      console.error('Unexpected error during file upload:', error);
      throw new Error('An unexpected error occurred during file upload');
    }
  }

  async listFiles(repository_id: number): Promise<FileList> {
    try {
      const { data } = await apiClient.get<FileList>(this.getUrl(`/${repository_id}`));
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to list files:', error.response?.data?.detail || error.message);
        throw new Error(`Failed to list files: ${error.response?.data?.detail || error.message}`);
      }
      console.error('Unexpected error while listing files:', error);
      throw new Error('An unexpected error occurred while listing files');
    }
  }

  async deleteFile(repository_id: number, filename: string): Promise<{ message: string }> {
    try {
      const { data } = await apiClient.del<{ message: string }>(this.getUrl(`/${repository_id}/files/${filename}`));
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to delete file:', error.response?.data?.detail || error.message);
        throw new Error(`Failed to delete file: ${error.response?.data?.detail || error.message}`);
      }
      console.error('Unexpected error while deleting the file:', error);
      throw new Error('An unexpected error occurred while deleting the file');
    }
  }
}

export default new FileAPI();