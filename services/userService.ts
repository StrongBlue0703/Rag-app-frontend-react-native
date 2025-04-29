import UserAPI from '@/api/userApi';
import {
  UserResponse,
  RegisterUserParams,
  UpdatePhoneParams,
  GetUserParams
} from '@/interfaces/user';

class UserService {
  private api: UserAPI;

  constructor() {
    this.api = new UserAPI();
  }

  private cleanPhoneNumber(phone: string): string {
    if (!phone) return phone;
    // Keep the leading + if it exists
    const hasPlus = phone.startsWith('+');
    // Remove all non-digit characters
    const cleaned = phone.replace(/[^\d]/g, '');
    // Add back the + if it existed
    return hasPlus ? `+${cleaned}` : cleaned;
  }

  private validatePhoneFormat(phone: string): boolean {
    const cleaned = this.cleanPhoneNumber(phone);
    // Check if the cleaned number matches the pattern (9-15 digits with optional +)
    return /^\+?\d{9,15}$/.test(cleaned);
  }

  async registerUser(params: RegisterUserParams): Promise<UserResponse> {
    try {
      const cleanedPhone = this.cleanPhoneNumber(params.phone_number);
      if (!this.validatePhoneFormat(cleanedPhone)) {
        throw new Error('Invalid phone number format. Must be between 9 and 15 digits.');
      }
      const response = await this.api.registerUser({
        phone_number: cleanedPhone
      });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to register user: ${error.message}`);
      }
      throw new Error('Failed to register user: Unknown error occurred');
    }
  }

  async loginUser(params: RegisterUserParams): Promise<UserResponse> {
    try {
      const cleanedPhone = this.cleanPhoneNumber(params.phone_number);
      if (!this.validatePhoneFormat(cleanedPhone)) {
        throw new Error('Invalid phone number format. Must be between 9 and 15 digits.');
      }
      const response = await this.api.loginUser({
        phone_number: cleanedPhone
      });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to login user: ${error.message}`);
      }
      throw new Error('Failed to login user: Unknown error occurred');
    }
  }

  async updatePhoneNumber(params: UpdatePhoneParams): Promise<UserResponse> {
    try {
      const cleanedPhone = this.cleanPhoneNumber(params.phone_number);
      if (!this.validatePhoneFormat(cleanedPhone)) {
        throw new Error('Invalid phone number format. Must be between 9 and 15 digits.');
      }
      const response = await this.api.updatePhoneNumber({
        ...params,
        phone_number: cleanedPhone
      });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update phone number: ${error.message}`);
      }
      throw new Error('Failed to update phone number: Unknown error occurred');
    }
  }

  async getUser(params: GetUserParams): Promise<UserResponse> {
    try {
      const response = await this.api.getUser(params);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get user: ${error.message}`);
      }
      throw new Error('Failed to get user: Unknown error occurred');
    }
  }

  async validatePhoneNumber(phone_number: string): Promise<boolean> {
    const cleanedPhone = this.cleanPhoneNumber(phone_number);
    if (!this.validatePhoneFormat(cleanedPhone)) {
      throw new Error('Invalid phone number format. Must be between 9 and 15 digits.');
    }
    return true;
  }
}

export default UserService;