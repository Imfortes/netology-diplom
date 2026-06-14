import React from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminUsers } from './hooks/useAdminUsers';  // ← правильный путь
import { AdminHeader } from './components/AdminHeader';
import { AdminStats } from './components/AdminStats';
import { AdminAlerts } from './components/AdminAlerts';
import { UsersTable } from './components/UsersTable';
import { AdminInfoCard } from './components/AdminInfoCard';
import type { UserWithStorage } from './types/admin.types';

export const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
    loading,
    error,
    successMessage,
    actionLoading,
    loadUsers,
    handleDelete,
    handleToggleAdmin,
    clearMessages,
  } = useAdminUsers();

  // Подсчет статистики
  const adminCount = users.filter((u: UserWithStorage) => u.is_admin).length;
  const regularCount = users.filter((u: UserWithStorage) => !u.is_admin).length;

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Загрузка пользователей...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <AdminHeader />

      <AdminStats
        totalUsers={users.length}
        regularCount={regularCount}
        adminCount={adminCount}
      />

      <AdminAlerts
        error={error}
        successMessage={successMessage}
        onCloseError={clearMessages}
        onCloseSuccess={clearMessages}
      />

      <UsersTable
        users={users}
        currentUserId={currentUser?.id}
        actionLoading={actionLoading}
        onToggleAdmin={handleToggleAdmin}
        onDelete={handleDelete}
      />

      <AdminInfoCard onRefresh={loadUsers} />
    </Container>
  );
};