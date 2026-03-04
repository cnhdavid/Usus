export interface Habit {
  id: number;
  name: string;
  description: string;
  frequency: string;
  targetCount: number;
  targetValue?: number;
  unit?: string;
  category?: string;
  createdAt: string;
  userId: number;
}

export interface CreateHabitRequest {
  name: string;
  description: string;
  frequency: string;
  targetCount: number;
  targetValue?: number;
  unit?: string;
  category?: string;
  userId: number;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  frequency?: string;
  targetCount?: number;
  targetValue?: number;
  unit?: string;
  category?: string;
}

export interface DailyLog {
  id: number;
  date: string;
  completedCount: number;
  value?: number;
  notes?: string;
  habitId: number;
}

export interface CreateDailyLogRequest {
  date: string;
  completedCount: number;
  value?: number;
  notes?: string;
  habitId: number;
}

export interface UpdateDailyLogRequest {
  completedCount?: number;
  value?: number;
  notes?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
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
