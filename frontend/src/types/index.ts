export interface Habit {
  id: number;
  name: string;
  description: string;
  frequency: string;
  targetCount: number;
  createdAt: string;
  userId: number;
}

export interface CreateHabitRequest {
  name: string;
  description: string;
  frequency: string;
  targetCount: number;
  userId: number;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  frequency?: string;
  targetCount?: number;
}

export interface DailyLog {
  id: number;
  date: string;
  completedCount: number;
  notes?: string;
  habitId: number;
}

export interface CreateDailyLogRequest {
  date: string;
  completedCount: number;
  notes?: string;
  habitId: number;
}

export interface UpdateDailyLogRequest {
  completedCount?: number;
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

export interface HabitWithLogs extends Habit {
  logs?: DailyLog[];
  currentStreak?: number;
  completionRate?: number;
}
