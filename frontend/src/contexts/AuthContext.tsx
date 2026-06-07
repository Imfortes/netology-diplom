import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/auth';
import type { User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const userData = await getCurrentUser();
    setUser(userData);
  };

  useEffect(() => {
    // Исправлено: сначала fetchUser, потом отдельно setLoading(false)
    fetchUser().then(() => setLoading(false));
  }, []); // Пустой массив зависимостей - эффект выполнится только один раз

  const login = async (username: string, password: string) => {
    const userData = await apiLogin(username, password);
    setUser(userData);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetchUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};