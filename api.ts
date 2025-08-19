// src/api.ts

import axios from 'axios';

// This is the smart part. It will use your live URL when deployed,
// but it will still use localhost when you are running it on your own computer.
const API_BASE_URL ='https://your-backend-name.onrender.com' ;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// This is the "interceptor" that runs before every single request.
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from storage using the CORRECT key.
    const token = localStorage.getItem('billboard_inspector_token');
    
    // 2. If the token exists, attach it to the request.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Send the request on its way.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;