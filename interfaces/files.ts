import { CancelToken, AxiosProgressEvent } from 'axios';

export interface RNFile {
  uri: string;
  name: string;
  type: string;
}

export interface FileMetadata {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  repository_id: number;
  phone_number: string;
  mime_type: string;
  storage_path: string;
  upload_date: string;
}

export interface FileResponse {
  message: string;
  file_metadata: FileMetadata[];
}

export interface FileList {
  repository_id: number;
  phone_number: string;
  files: FileMetadata[];
}

export interface ErrorResponse {
  detail: string;
}

// API Request Types
export interface UploadFileParams {
  phone_number: string;
  repository_id: number;
  files: RNFile[];
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  cancelToken?: CancelToken;
}

export interface ListFilesParams {
  phone_number: string;
  repository_id: number;
}

export interface DeleteFileParams {
  phone_number: string;
  repository_id: number;
  filename: string;
}

export interface UploadConfig {
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  cancelToken?: CancelToken;
}