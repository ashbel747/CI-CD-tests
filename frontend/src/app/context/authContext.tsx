'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall } from '../lib/auth';

// Define the shape of your state
interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}

// Define the shape of your context's value
interface AuthContextType {
  user: AuthState | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: { name: string; email: string; password: string; role: 'buyer' | 'seller'; }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    if (accessToken && userId) {
      setUser({ isAuthenticated: true, userId });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      // Use the centralized apiCall function
      const data = await apiCall('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.userId);
      }

      setUser({ isAuthenticated: true, userId: data.userId });
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller';
  }): Promise<void> => {
    setLoading(true);
    try {
      await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      // Handle the success case in the component
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
    }
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
