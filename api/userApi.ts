import {
  User,
  UserResponse,
  UserError,
  RegisterUserParams,
  UpdatePhoneParams,
  GetUserParams
} from '../interfaces/user';
import { getConfig } from './config';
import * as apiClient from '../utils/apiClient';

class UserAPI {
  private config;

  constructor() {
    this.config = getConfig();
  }

  private getUrl(path: string): string {
    // Ensure path starts with slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.config.apiPrefix}/users${normalizedPath}`;
  }

  private cleanPhoneNumber(phone: string): string {
    if (!phone) return phone;
    const hasPlus = phone.startsWith('+');
    const cleaned = phone.replace(/[^\d]/g, '');
    return hasPlus ? `+${cleaned}` : cleaned;
  }

  async registerUser({ phone_number }: RegisterUserParams): Promise<UserResponse> {
    const cleanedPhone = this.cleanPhoneNumber(phone_number);
    try {
      const { data } = await apiClient.post<UserResponse>(this.getUrl('/register'), { phone_number: cleanedPhone });
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to register user: ${error.message}`);
      }
      throw new Error('Failed to register user: Unknown error occurred');
    }
  }

  async loginUser({ phone_number }: RegisterUserParams): Promise<UserResponse> {
    const cleanedPhone = this.cleanPhoneNumber(phone_number);
    try {
      const { data } = await apiClient.post<UserResponse>(this.getUrl('/login'), { phone_number: cleanedPhone });
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to login user: ${error.message}`);
      }
      throw new Error('Failed to login user: Unknown error occurred');
    }
  }

  async updatePhoneNumber({ user_id, phone_number }: UpdatePhoneParams): Promise<UserResponse> {
    const cleanedPhone = this.cleanPhoneNumber(phone_number);
    try {
      const { data } = await apiClient.put<UserResponse>(this.getUrl(`/${user_id}/phone`), { phone_number: cleanedPhone });
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update phone number: ${error.message}`);
      }
      throw new Error('Failed to update phone number: Unknown error occurred');
    }
  }

  async getUser({ user_id }: GetUserParams): Promise<UserResponse> {
    try {
      const { data } = await apiClient.get<UserResponse>(this.getUrl(`/${user_id}`));
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get user: ${error.message}`);
      }
      throw new Error('Failed to get user: Unknown error occurred');
    }
  }

  async validatePhoneNumber(phone_number: string): Promise<boolean> {
    const cleanedPhone = this.cleanPhoneNumber(phone_number);
    const phoneRegex = /^\+?\d{9,15}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      throw new Error('Invalid phone number format. Must be between 9 and 15 digits.');
    }
    return true;
  }
}

export default UserAPI;