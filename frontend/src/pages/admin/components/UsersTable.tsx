import React from 'react';
import { Card, Table } from 'react-bootstrap';
import type { UserWithStorage } from '../types/admin.types';
import { UserRow } from './UserRow';

interface UsersTableProps {
  users: UserWithStorage[];
  currentUserId?: number;
  actionLoading: number | null;
  onToggleAdmin: (userId: number, userName: string, isCurrentlyAdmin: boolean) => void;
  onDelete: (userId: number, userName: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  currentUserId,
  actionLoading,
  onToggleAdmin,
  onDelete,
}) => {
  return (
    <Card className="shadow-sm">
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="border-0 py-3 px-4">ID</th>
                <th className="border-0 py-3 px-4">👤 Логин</th>
                <th className="border-0 py-3 px-4">📧 Email</th>
                <th className="border-0 py-3 px-4">📝 Полное имя</th>
                <th className="border-0 py-3 px-4">💾 Использовано</th>
                <th className="border-0 py-3 px-4">👑 Админ</th>
                <th className="border-0 py-3 px-4 text-end">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <UserRow
                  key={user.id}
                  user={user}
                  isCurrentUser={user.id === currentUserId}
                  actionLoading={actionLoading}
                  onToggleAdmin={onToggleAdmin}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};