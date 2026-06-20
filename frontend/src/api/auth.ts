import apiClient from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  storage_path?: string;
  storage_limit?: number;
  storage_used?: number;
  storage_limit_display?: string;
  storage_used_display?: string;
  storage_percent?: number;
}

export interface RegisterData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  password2: string;
}

export const register = async (data: RegisterData): Promise<User> => {
  const response = await apiClient.post('/register/', data);
  return response.data.user;
};

export const login = async (username: string, password: string): Promise<User> => {
  const response = await apiClient.post('/login/', { username, password });
  return response.data.user;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/logout/');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/me/');
    return response.data;
  } catch {
    return null;
  }
};

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/users/');
  return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await apiClient.delete(`/users/${userId}/`);
};

export const toggleAdmin = async (userId: number): Promise<void> => {
  await apiClient.post(`/users/${userId}/toggle-admin/`);
};

export const getStorageInfoForUser = async (userId: number): Promise<any> => {
  const response = await apiClient.get(`/storage/info/${userId}/`);
  return response.data;
};