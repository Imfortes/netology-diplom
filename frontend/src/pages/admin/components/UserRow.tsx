import React from 'react';
import { Badge } from 'react-bootstrap';
import type { UserWithStorage } from '../types/admin.types';
import { StorageCell } from './StorageCell';
import { AdminActions } from './AdminActions';

interface UserRowProps {
  user: UserWithStorage;
  isCurrentUser: boolean;
  actionLoading: number | null;
  onToggleAdmin: (userId: number, userName: string, isCurrentlyAdmin: boolean) => void;
  onDelete: (userId: number, userName: string) => void;
}

export const UserRow: React.FC<UserRowProps> = ({
  user,
  isCurrentUser,
  actionLoading,
  onToggleAdmin,
  onDelete,
}) => {
  return (
    <tr className="align-middle">
      <td className="py-3 px-4 text-muted">{user.id}</td>
      <td className="py-3 px-4 fw-semibold">
        {user.username}
        {isCurrentUser && (
          <Badge bg="info" className="ms-2">Вы</Badge>
        )}
      </td>
      <td className="py-3 px-4">{user.email || '—'}</td>
      <td className="py-3 px-4">{user.full_name || '—'}</td>
      <td className="py-3 px-4">
        <StorageCell
          usedDisplay={user.storage_used_display || '0 MB'}
          limitDisplay={user.storage_limit_display || '1 GB'}
          percent={user.storage_percent || 0}
        />
      </td>
      <td className="py-3 px-4">
        {user.is_admin ? (
          <Badge bg="warning" className="text-dark">Администратор</Badge>
        ) : (
          <Badge bg="secondary">Пользователь</Badge>
        )}
      </td>
      <td className="py-3 px-4 text-end">
        {!isCurrentUser && (
          <AdminActions
            isAdmin={user.is_admin}
            isLoading={actionLoading === user.id}
            onToggleAdmin={() => onToggleAdmin(user.id, user.username, user.is_admin)}
            onDelete={() => onDelete(user.id, user.username)}
          />
        )}
      </td>
    </tr>
  );
};