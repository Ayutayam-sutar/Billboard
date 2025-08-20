// src/api.ts
import axios from 'axios';

// This is now permanently set to your live backend address.
// ❗️ You MUST replace the placeholder with your real Render URL.
const API_BASE_URL = 'https://billboard-inspector-backend.onrender.com'; 

const api = axios.create({
  baseURL: API_BASE_URL,
});

// This automatically adds your login token to every request.
api.interceptors.request.use(
  (config) => {
    // It correctly looks for 'billboard_inspector_token'.
    const token = localStorage.getItem('billboard_inspector_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;