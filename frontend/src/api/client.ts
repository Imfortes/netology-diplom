import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем CSRF токен для POST запросов
apiClient.interceptors.request.use(async (config) => {
  if (config.method === 'post' || config.method === 'delete' || config.method === 'put') {
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];

    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
});

export default apiClient;