import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Мои файлы</h1>
      <p>Добро пожаловать, {user?.full_name}!</p>
      <p>Здесь будет список ваших файлов (скоро)</p>
    </div>
  );
};