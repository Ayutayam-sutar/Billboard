// services/authService.ts

import api from '../api'; // Our smart helper that adds the token to requests
import { jwtDecode } from 'jwt-decode'; // The new library to read token info
import { User } from '../types'; // Assuming your User type is defined here

const TOKEN_STORAGE_KEY = 'billboard_inspector_token';

// Brick 1: The New Login Function

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post('/login', { email, password });
    
    if (response.data && response.data.token) {
      const { token } = response.data;
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      // Decode the token to get user info immediately after login
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

// Brick 2: The New Logout Function

export const logout = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

// Brick 3: The New Get Current User Function

export const getCurrentUser = (): User | null => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return null;
    }
    
    // The decoded token payload will have the user's id and name
    const decodedToken: { id: string, name: string, exp: number } = jwtDecode(token);

    
    if (decodedToken.exp * 1000 < Date.now()) {
      logout(); 
      return null;
    }
    
    
    return {
      id: decodedToken.id,
      name: decodedToken.name,
      email: '', // Not in token
      avatar: `https://i.pravatar.cc/150?u=${decodedToken.id}`, // Generate a consistent avatar
      contributionScore: 0 // Not in token
    };

  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

