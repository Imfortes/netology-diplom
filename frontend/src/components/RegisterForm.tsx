import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    password2: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await register(formData);
      navigate('/login');
    } catch (err: any) {
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="username"
            placeholder="Логин (латиница, 4-20 символов)"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          {errors.username && <div style={{ color: 'red', fontSize: '12px' }}>{errors.username[0]}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          {errors.email && <div style={{ color: 'red', fontSize: '12px' }}>{errors.email[0]}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="full_name"
            placeholder="Полное имя"
            value={formData.full_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          {errors.full_name && <div style={{ color: 'red', fontSize: '12px' }}>{errors.full_name[0]}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            name="password"
            placeholder="Пароль (6+ символов, заглавная буква, цифра, спецсимвол)"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          {errors.password && <div style={{ color: 'red', fontSize: '12px' }}>{errors.password[0]}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            name="password2"
            placeholder="Подтверждение пароля"
            value={formData.password2}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          {errors.password2 && <div style={{ color: 'red', fontSize: '12px' }}>{errors.password2[0]}</div>}
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};