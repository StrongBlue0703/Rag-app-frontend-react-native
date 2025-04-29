export interface Repository {
  id: number;
  name: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export interface RepositoryCreate {
  name: string;
}

export interface RepositoryResponse {
  id: number;
  name: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRepositoryParams {
  name: string;
}

export interface UpdateRepositoryParams {
  phone_number: string;
  repository_id: number;
  new_name: string;
}

export interface DeleteRepositoryParams {
  phone_number: string;
  repository_id: number;
}

export interface ListRepositoriesParams {
  phone_number: string;
}

export interface GetRepositoryDetailsParams {
  phone_number: string;
  repository_id: number;
}

export type RepositoryErrorType = 'NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'UNKNOWN_ERROR';

export class RepositoryError extends Error {
  constructor(message: string, public type: RepositoryErrorType) {
    super(message);
    this.name = 'RepositoryError';
  }
}