import type {
  Habit,
  CreateHabitRequest,
  UpdateHabitRequest,
  DailyLog,
  CreateDailyLogRequest,
  UpdateDailyLogRequest,
  User,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
} from '../types';

const API_BASE_URL = '/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: 'include', // Cookies immer mitsenden
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // 204 No Content hat keinen Body
    if (response.status === 204) return undefined as unknown as T;

    return response.json();
  }

  habits = {
    getAll: () =>
      this.request<Habit[]>(`/habits`),

    getById: (id: number) =>
      this.request<Habit>(`/habits/${id}`),

    create: (data: CreateHabitRequest) =>
      this.request<Habit>('/habits', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: number, data: UpdateHabitRequest) =>
      this.request<Habit>(`/habits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      this.request<void>(`/habits/${id}`, {
        method: 'DELETE',
      }),
  };

  logs = {
    getByHabit: (habitId: number) =>
      this.request<DailyLog[]>(`/logs/habit/${habitId}`),

    getById: (id: number) =>
      this.request<DailyLog>(`/logs/${id}`),

    create: (data: CreateDailyLogRequest) =>
      this.request<DailyLog>('/logs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: number, data: UpdateDailyLogRequest) =>
      this.request<DailyLog>(`/logs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      this.request<void>(`/logs/${id}`, {
        method: 'DELETE',
      }),
  };

  users = {
    me: () =>
      this.request<LoginResponse>('/user/me'),

    getById: (id: number) =>
      this.request<User>(`/user/${id}`),

    signup: (data: CreateUserRequest) =>
      this.request<LoginResponse>('/user', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: LoginRequest) =>
      this.request<LoginResponse>('/user/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    logout: () =>
      this.request<void>('/user/logout', { method: 'POST' }),

    update: (id: number, data: Partial<CreateUserRequest>) =>
      this.request<User>(`/user/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      this.request<void>(`/user/${id}`, {
        method: 'DELETE',
      }),
  };
}

export const apiClient = new ApiClient();
