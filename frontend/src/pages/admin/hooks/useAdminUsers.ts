import { useState, useCallback, useEffect } from 'react';
import { getUsers, deleteUser, toggleAdmin, getStorageInfoForUser } from '../../../api/auth';
import type { User } from '../../../api/auth';
import type { UserWithStorage } from '../types/admin.types';

export const useAdminUsers = () => {
  const [users, setUsers] = useState<UserWithStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔵 Загрузка пользователей...');
      const data = await getUsers();
      console.log('🟢 Получены пользователи:', data);

      const usersWithStorage = await Promise.all(
        data.map(async (user: User) => {
          try {
            console.log(`📦 Загрузка storage для user ${user.id} (${user.username})`);
            const storageInfo = await getStorageInfoForUser(user.id);
            console.log(`✅ Storage для ${user.username}:`, storageInfo);
            return {
              ...user,
              storage_used_display: storageInfo.storage_used_display,
              storage_limit_display: storageInfo.storage_limit_display,
              storage_percent: storageInfo.storage_percent,
            };
          } catch (err) {
            console.error(`❌ Ошибка загрузки storage для user ${user.id}`, err);
            return {
              ...user,
              storage_used_display: '0 MB',
              storage_limit_display: '1 GB',
              storage_percent: 0,
            };
          }
        })
      );

      console.log('.')
      console.log('🎉 Финальные данные:', usersWithStorage);
      setUsers(usersWithStorage);
    } catch (error: any) {
      console.error('🔴 Критическая ошибка:', error);
      setError(error.response?.data?.error || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (userId: number, userName: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?`)) {
      try {
        setActionLoading(userId);
        await deleteUser(userId);
        setSuccessMessage(`Пользователь "${userName}" успешно удален`);
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadUsers();
      } catch (error: any) {
        setError(error.response?.data?.error || 'Ошибка удаления пользователя');
        setTimeout(() => setError(null), 3000);
      } finally {
        setActionLoading(null);
      }
    }
  }, [loadUsers]);

  const handleToggleAdmin = useCallback(async (userId: number, userName: string, isCurrentlyAdmin: boolean) => {
    try {
      setActionLoading(userId);
      await toggleAdmin(userId);
      setSuccessMessage(
        `Статус администратора для "${userName}" изменен: ${isCurrentlyAdmin ? 'снят' : 'назначен'}`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Ошибка изменения статуса');
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(null);
    }
  }, [loadUsers]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    successMessage,
    actionLoading,
    loadUsers,
    handleDelete,
    handleToggleAdmin,
    clearMessages,
  };
};