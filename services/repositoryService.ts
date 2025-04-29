import RepositoryAPI from '@/api/repositoryApi';
import {
  Repository,
  RepositoryResponse,
  CreateRepositoryParams,
  UpdateRepositoryParams,
  DeleteRepositoryParams,
  ListRepositoriesParams,
} from '@/interfaces/repository';

class RepositoryService {
  private api: RepositoryAPI;
  private readonly NAME_MIN_LENGTH = 3;
  private readonly NAME_MAX_LENGTH = 50;
  private readonly NAME_REGEX = /^[a-zA-Z0-9-_]+$/;

  constructor() {
    this.api = new RepositoryAPI();
  }

  private validateRepositoryName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Repository name is required');
    }

    const trimmedName = name.trim();

    if (trimmedName.length < this.NAME_MIN_LENGTH) {
      throw new Error(`Repository name must be at least ${this.NAME_MIN_LENGTH} characters long`);
    }

    if (trimmedName.length > this.NAME_MAX_LENGTH) {
      throw new Error(`Repository name cannot exceed ${this.NAME_MAX_LENGTH} characters`);
    }

    if (!this.NAME_REGEX.test(trimmedName)) {
      throw new Error('Repository name can only contain letters, numbers, hyphens, and underscores');
    }
  }

  private validatePhoneNumber(phoneNumber: string): void {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error('Phone number is required');
    }

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      throw new Error('Phone number cannot be empty');
    }
  }

  async createRepository(params: CreateRepositoryParams): Promise<Repository> {
    try {
      this.validatePhoneNumber(params.phone_number);
      this.validateRepositoryName(params.name);

      const response = await this.api.createRepository({
        phone_number: params.phone_number.trim(),
        name: params.name.trim(),
      });

      return this.transformRepositoryResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create repository: ${error.message}`);
      }
      throw new Error('Failed to create repository: Unknown error occurred');
    }
  }

  async listRepositories(params: ListRepositoriesParams): Promise<Repository[]> {
    try {
      this.validatePhoneNumber(params.phone_number);
      const repositories = await this.api.listRepositories({
        phone_number: params.phone_number.trim(),
      });
      return repositories.map(repo => this.transformRepositoryResponse(repo));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list repositories: ${error.message}`);
      }
      throw new Error('Failed to list repositories: Unknown error occurred');
    }
  }

  async updateRepository(params: UpdateRepositoryParams): Promise<Repository> {
    try {
      this.validatePhoneNumber(params.phone_number);
      this.validateRepositoryName(params.new_name);
      this.validateRepositoryName(params.repository_name);

      const response = await this.api.updateRepository({
        phone_number: params.phone_number.trim(),
        repository_name: params.repository_name.trim(),
        new_name: params.new_name.trim(),
      });

      return this.transformRepositoryResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update repository: ${error.message}`);
      }
      throw new Error('Failed to update repository: Unknown error occurred');
    }
  }

  async deleteRepository(params: DeleteRepositoryParams): Promise<{ message: string }> {
    try {
      this.validatePhoneNumber(params.phone_number);
      this.validateRepositoryName(params.repository_name);

      return await this.api.deleteRepository({
        phone_number: params.phone_number.trim(),
        repository_name: params.repository_name.trim(),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete repository: ${error.message}`);
      }
      throw new Error('Failed to delete repository: Unknown error occurred');
    }
  }

  private transformRepositoryResponse(response: RepositoryResponse): Repository {
    return {
      id: response.id,
      name: response.name,
      phone_number: response.phone_number,
      created_at: response.created_at,
      updated_at: response.updated_at,
    };
  }

  validateRepositoryNameFormat(name: string): boolean {
    try {
      this.validateRepositoryName(name);
      return true;
    } catch (error) {
      return false;
    }
  }

  getRepositoryNameValidationRules(): string {
    return [
      `Must be between ${this.NAME_MIN_LENGTH} and ${this.NAME_MAX_LENGTH} characters long`,
      'Can only contain letters, numbers, hyphens, and underscores',
      'Cannot be empty or contain only spaces',
    ].join('\n');
  }
}

export default RepositoryService;