/**
 * API client for React Native (Expo).
 *
 * The URL is injected automatically at startup by scripts/set-env.js
 * which detects your current LAN IP and writes it to .env as
 * EXPO_PUBLIC_API_URL=http://<LAN_IP>:5112/api
 *
 * Just run `npm start` — no manual configuration needed.
 *
 * Cookie persistence:
 * `credentials: 'include'` tells React Native's HTTP layer (NSURLSession on
 * iOS, OkHttp on Android) to handle Set-Cookie/Cookie headers automatically
 * via the native cookie jar — which persists across app restarts on iOS.
 * On Android we additionally persist the cookie value in AsyncStorage via
 * cookieStore as a backup so sessions survive process restarts there too.
 * ─────────────────────────────────────────────────────────────────
 */

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
import { cookieStore } from '../utils/cookieStore';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5112/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // credentials: 'include' activates the native cookie jar (NSURLSession /
    // OkHttp). This is the primary mechanism for sending the session cookie.
    // Additionally we persist the raw cookie value in AsyncStorage so that
    // Android sessions survive process restarts (the native jar is in-memory).
    const storedCookie = await cookieStore.load();
    const cookieHeader: Record<string, string> = storedCookie
      ? { Cookie: storedCookie }
      : {};

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: 'include',           // ← native cookie jar (primary)
      headers: {
        'Content-Type': 'application/json',
        ...cookieHeader,                // ← AsyncStorage backup (Android)
        ...options?.headers,
      },
      ...options,
    });

    // Persist cookie when the server sends one (works on Android where
    // Set-Cookie is readable; on iOS the native jar handles it silently).
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      await cookieStore.save(setCookie);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) return undefined as unknown as T;
    return response.json();
  }

  /** Remove the locally persisted session cookie (call on logout). */
  clearSession = (): Promise<void> => cookieStore.clear();

  habits = {
    getAll: () => this.request<Habit[]>('/habits'),
    getById: (id: number) => this.request<Habit>(`/habits/${id}`),
    create: (data: CreateHabitRequest) =>
      this.request<Habit>('/habits', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: UpdateHabitRequest) =>
      this.request<Habit>(`/habits/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      this.request<void>(`/habits/${id}`, { method: 'DELETE' }),
  };

  logs = {
    getByHabit: (habitId: number) => this.request<DailyLog[]>(`/logs/habit/${habitId}`),
    getById: (id: number) => this.request<DailyLog>(`/logs/${id}`),
    create: (data: CreateDailyLogRequest) =>
      this.request<DailyLog>('/logs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: UpdateDailyLogRequest) =>
      this.request<DailyLog>(`/logs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      this.request<void>(`/logs/${id}`, { method: 'DELETE' }),
  };

  users = {
    me: () => this.request<LoginResponse>('/user/me'),
    getById: (id: number) => this.request<User>(`/user/${id}`),
    signup: (data: CreateUserRequest) =>
      this.request<LoginResponse>('/user', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: LoginRequest) =>
      this.request<LoginResponse>('/user/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => this.request<void>('/user/logout', { method: 'POST' }),
    update: (id: number, data: Partial<CreateUserRequest>) =>
      this.request<User>(`/user/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => this.request<void>(`/user/${id}`, { method: 'DELETE' }),
  };
}

export const apiClient = new ApiClient();
