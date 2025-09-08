'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall } from '../lib/auth';

// Enhanced user profile interface
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
}

// Enhanced auth state interface
interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  userProfile: UserProfile | null;
}

// Enhanced context interface
interface AuthContextType {
  user: AuthState | null;
  loading: boolean;
  error: string | null;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: { 
    name: string; 
    email: string; 
    password: string; 
    role: 'buyer' | 'seller'; 
  }) => Promise<void>;
  logout: () => void;
  
  // Profile methods
  getUserProfile: () => Promise<UserProfile | null>;
  updateUserProfile: (data: Partial<Pick<UserProfile, "name" | "email" | "role">>) => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  getAuthToken: () => string | null;
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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

        if (accessToken && userId) {
          // Try to fetch user profile to verify token is still valid
          try {
            const profile = await fetchUserProfile();
            setUser({ 
              isAuthenticated: true, 
              userId,
              userProfile: profile 
            });
          } catch (err) {
            // Token might be invalid, clear storage
            clearAuthStorage();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Helper function to clear auth storage
  const clearAuthStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
    }
  };

  // Helper function to fetch user profile
  const fetchUserProfile = async (): Promise<UserProfile> => {
    const data = await apiCall('/auth/me', {
      method: 'GET',
    });
    return data;
  };

  // Clear error helper
  const clearError = () => {
    setError(null);
  };

  // Get current auth token
  const getAuthToken = (): string | null => {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  };

  // Login method
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.userId);
      }

      // Fetch user profile after successful login
      const profile = await fetchUserProfile();
      
      setUser({ 
        isAuthenticated: true, 
        userId: data.userId,
        userProfile: profile 
      });
      
      router.push('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err; // Re-throw for component handling
    } finally {
      setLoading(false);
    }
  };

  // Signup method
  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller';
  }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      // Note: After signup, user typically needs to login separately
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user profile method
  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user?.isAuthenticated) {
      return null;
    }

    try {
      setError(null);
      const profile = await fetchUserProfile();
      
      // Update user state with fresh profile data
      setUser(prev => prev ? { ...prev, userProfile: profile } : null);
      
      return profile;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      return null;
    }
  };

  // Update user profile method
  const updateUserProfile = async (data: Partial<Pick<UserProfile, "name" | "email" | "role">>): Promise<void> => {
    if (!user?.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      setError(null);
      setLoading(true);
      
      const updatedProfile = await apiCall('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      // Update user state with updated profile
      setUser(prev => prev ? { 
        ...prev, 
        userProfile: updatedProfile.user || updatedProfile 
      } : null);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout method
  const logout = () => {
    clearAuthStorage();
    setUser(null);
    setError(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    getUserProfile,
    updateUserProfile,
    clearError,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};