// Billboard/api.ts

import axios from 'axios';

// Create a new "instance" of axios with a base URL
const api = axios.create({
  baseURL: 'http://localhost:3001', // Your backend server's address
});

// This is the "interceptor" that runs before every request
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from the browser's "wallet" (localStorage)
    const token = localStorage.getItem('token');
    
    // 2. If the token exists, attach it to the request's Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Send the request on its way with the new header
    return config;
  },
  (error) => {
    // Handle any errors
    return Promise.reject(error);
  }
);

export default api;