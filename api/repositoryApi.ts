import {
  RepositoryResponse,
  CreateRepositoryParams,
  UpdateRepositoryParams,
  DeleteRepositoryParams,
  ListRepositoriesParams,
  GetRepositoryDetailsParams,
  RepositoryError,
  RepositoryErrorType
} from '@/interfaces/repository';
import * as apiClient from '@/utils/apiClient';
import { BACKEND_URL } from '@/config/api';
import axios from 'axios';

class RepositoryAPI {
  private apiPrefix: string;

  constructor() {
    this.apiPrefix = `${BACKEND_URL}/repositories`;
  }

  private handleError(error: unknown, action: string): never {
    let errorType: RepositoryErrorType = 'UNKNOWN_ERROR';
    let errorMessage = `Failed to ${action}: Unknown error occurred`;

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        errorType = 'NOT_FOUND';
        errorMessage = `Repository not found while trying to ${action}`;
      } else if (error.message.includes('401')) {
        errorType = 'UNAUTHORIZED';
        errorMessage = `Unauthorized: Please log in to ${action}`;
      } else if (error.message.includes('403')) {
        errorType = 'FORBIDDEN';
        errorMessage = `Forbidden: You don't have permission to ${action}`;
      } else {
        errorMessage = `Failed to ${action}: ${error.message}`;
      }
    }

    throw new RepositoryError(errorMessage, errorType);
  }

  async createRepository({ name }: CreateRepositoryParams, token: string | null): Promise<RepositoryResponse> {
    try {
      const { data } = await axios.post<RepositoryResponse>(this.apiPrefix, { name }, {
        headers: {
          Authorization: `Bearer ${token}`,          
        }
      });
      return data;
    } catch (error) {
      this.handleError(error, 'create repository');
    }
  }

  async listRepositories(token: string | null): Promise<RepositoryResponse[]> {
    try {
      // Pass the token in the request headers so the back-end can identify the current user
      const { data } = await axios.get<RepositoryResponse[]>(this.apiPrefix, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data || [];
    } catch (error) {
      this.handleError(error, 'list repositories');
      // Return an empty array or rethrow the error based on your error handling strategy
    }  
  }

  async getRepositoryDetails(repository_id: number, token: string | null): Promise<RepositoryResponse> {
    try {
      const { data } = await axios.get<RepositoryResponse>(`${this.apiPrefix}/${repository_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      this.handleError(error, 'get repository details');
    }
  }

  async updateRepository(repository_id: number, { new_name }: UpdateRepositoryParams, token: string | null): Promise<RepositoryResponse> {
    try {
      const { data } = await axios.put<RepositoryResponse>(`${this.apiPrefix}/${repository_id}`, { name: new_name }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      this.handleError(error, 'update repository');
    }
  }

  async deleteRepository(repository_id: number, token: string | null): Promise<{ message: string }> {
    try {
      const { data } = await axios.delete<{ message: string }>(`${this.apiPrefix}/${repository_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      this.handleError(error, 'delete repository');
    }
  }
}

export default RepositoryAPI;