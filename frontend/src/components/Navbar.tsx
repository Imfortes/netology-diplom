import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '15px' }}>Главная</Link>
      {user ? (
        <>
          <Link to="/dashboard" style={{ marginRight: '15px' }}>Мои файлы</Link>
          {user.is_admin && (
            <Link to="/admin" style={{ marginRight: '15px' }}>Админ панель</Link>
          )}
          <span style={{ marginRight: '15px' }}>Привет, {user.username}!</span>
          <button onClick={() => {
              logout();
              navigate('/');
            }}>Выйти</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: '15px' }}>Вход</Link>
          <Link to="/register">Регистрация</Link>
        </>
      )}
    </nav>
  );
};