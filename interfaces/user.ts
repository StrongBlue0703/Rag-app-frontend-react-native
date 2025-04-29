export interface User {
  id: number;
  phone_number: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreate {
  phone_number: string;
}

export interface UserInDB extends User {
  created_at: string;
  updated_at: string;
}

export interface UserUpdatePhone {
  phone_number: string;
}

export interface UserResponse {
  id: number;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterUserParams {
  phone_number: string;
}

export interface UpdatePhoneParams {
  user_id: number;
  phone_number: string;
}

export interface GetUserParams {
  user_id: number;
}

export interface UserError {
  detail: string;
}