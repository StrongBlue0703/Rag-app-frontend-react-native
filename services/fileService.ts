import FileAPI from '@/api/fileApi';
import { 
  FileMetadata, 
  FileResponse, 
  FileList, 
  UploadFileParams,
  ListFilesParams,
  DeleteFileParams 
} from '@/interfaces/files';

export interface FileServiceConfig {
  baseUrl: string;
  // Add any other configuration parameters needed by FileAPI
}

class FileService {
  private api: FileAPI;

  constructor(config: FileServiceConfig) {
    this.api = new FileAPI(config.baseUrl);
  }

  async uploadFile(params: UploadFileParams): Promise<FileResponse> {
    try {
      const response = await this.api.uploadFile(params.phone_number, params.repository.toString(), params.file);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to upload file: ${error.message}`);
      }
      throw new Error('Failed to upload file: Unknown error occurred');
    }
  }

  async listFiles(params: ListFilesParams): Promise<FileList> {
    try {
      const response = await this.api.listFiles(params.phone_number, params.repository.toString());
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list files: ${error.message}`);
      }
      throw new Error('Failed to list files: Unknown error occurred');
    }
  }

  async deleteFile(params: DeleteFileParams): Promise<{ message: string; filename: string }> {
    try {
      const response = await this.api.deleteFile(params.phone_number, params.repository.toString(), params.filename);
      return { ...response, filename: params.filename };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete file: ${error.message}`);
      }
      throw new Error('Failed to delete file: Unknown error occurred');
    }
  }

  async validateFileSize(file: File, maxSize: number): Promise<boolean> {
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }
    return true;
  }

  async validateFileType(file: File, allowedTypes: string[]): Promise<boolean> {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    return true;
  }
}

export default FileService;