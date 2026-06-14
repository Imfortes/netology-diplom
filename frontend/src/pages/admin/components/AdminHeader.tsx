import React from 'react';

export const AdminHeader: React.FC = () => {
  return (
    <div className="mb-4">
      <h1 className="display-6 fw-bold mb-2">
        👑 Управление пользователями
      </h1>
      <p className="text-muted">Управление учетными записями и правами доступа</p>
    </div>
  );
};