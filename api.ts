// src/api.ts
import axios from 'axios';



const API_BASE_URL = 'https://billboard-inspector-backend.onrender.com'; 

const api = axios.create({
  baseURL: API_BASE_URL,
});


api.interceptors.request.use(
  (config) => {
    
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