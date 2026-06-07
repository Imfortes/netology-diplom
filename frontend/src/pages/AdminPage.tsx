import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser, toggleAdmin } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../api/auth';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    if (window.confirm('Удалить пользователя?')) {
      await deleteUser(userId);
      loadUsers();
    }
  };

  const handleToggleAdmin = async (userId: number) => {
    await toggleAdmin(userId);
    loadUsers();
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h1>Управление пользователями</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th>ID</th>
            <th>Логин</th>
            <th>Email</th>
            <th>Полное имя</th>
            <th>Админ</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.full_name}</td>
              <td>{user.is_admin ? 'Да' : 'Нет'}</td>
              <td>
                {user.id !== currentUser?.id && (
                  <>
                    <button onClick={() => handleToggleAdmin(user.id)} style={{ marginRight: '5px' }}>
                      {user.is_admin ? 'Снять админа' : 'Сделать админом'}
                    </button>
                    <button onClick={() => handleDelete(user.id)} style={{ color: 'red' }}>
                      Удалить
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};