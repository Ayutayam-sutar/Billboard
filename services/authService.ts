// services/authService.ts

import api from '../api'; 
import { jwtDecode } from 'jwt-decode'; 
import { User } from '../types'; 

const TOKEN_STORAGE_KEY = 'billboard_inspector_token';



export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post('/login', { email, password });
    
    if (response.data && response.data.token) {
      const { token } = response.data;
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      
      const user = getCurrentUser();
      if (user) {
        return user;
      } else {
        throw new Error("Invalid token received");
      }
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login service error:", error);
    
    throw error;
  }
};



export const logout = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};



export const getCurrentUser = (): User | null => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return null;
    }
    
    
    const decodedToken: { id: string, name: string, exp: number } = jwtDecode(token);

    
    if (decodedToken.exp * 1000 < Date.now()) {
      logout(); 
      return null;
    }
    
    
    return {
      id: decodedToken.id,
      name: decodedToken.name,
      email: '', 
      avatar: `https://i.pravatar.cc/150?u=${decodedToken.id}`, 
      contributionScore: 0 
    };

  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

