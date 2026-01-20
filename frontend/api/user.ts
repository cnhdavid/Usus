const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5112/api';

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export const userApi = {
  async createUser(userData: CreateUserRequest): Promise<UserDto> {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create user' }));
      throw new Error(error.message || 'Failed to create user');
    }

    return response.json();
  },

  async getUser(id: number): Promise<UserDto> {
    const response = await fetch(`${API_BASE_URL}/user/${id}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
      throw new Error(error.message || 'Failed to fetch user');
    }

    return response.json();
  },

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Invalid email or password' }));
      throw new Error(error.message || 'Invalid email or password');
    }

    return response.json();
  }
};
