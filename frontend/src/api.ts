import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 5000,
})

export const getHello = () => api.get('/hello/')