
import axios from 'axios';

const Api = axios.create({
  baseURL: 'https://back-bursopuri.vercel.app/',
  headers: {
    'Content-Type': 'application/json',
  },
});

Api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default Api;
