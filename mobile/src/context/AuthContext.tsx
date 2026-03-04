import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiClient } from '../api/client';
import type { LoginRequest, LoginResponse, CreateUserRequest } from '../types';

interface AuthContextType {
  user: LoginResponse | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: CreateUserRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start: check for existing session via cookie
  useEffect(() => {
    apiClient.users
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await apiClient.users.login(data);
    setUser(response);
  };

  const signup = async (data: CreateUserRequest) => {
    const response = await apiClient.users.signup(data);
    setUser(response);
  };

  const logout = async () => {
    await apiClient.users.logout();
    await apiClient.clearSession(); // remove persisted cookie from AsyncStorage
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
