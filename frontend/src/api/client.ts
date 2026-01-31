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

const API_BASE_URL = 'http://localhost:5000/api';

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

    return response.json();
  }

  habits = {
    getAll: (userId: number = 1) =>
      this.request<Habit[]>(`/habits?userId=${userId}`),

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
    getById: (id: number) =>
      this.request<User>(`/user/${id}`),

    create: (data: CreateUserRequest) =>
      this.request<User>('/user', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: LoginRequest) =>
      this.request<LoginResponse>('/user/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

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
