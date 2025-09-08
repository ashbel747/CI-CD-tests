// lib/profile-api.ts
import { apiCall } from './auth';

// Use the same UserProfile interface as AuthContext for consistency
export type UserProfile = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

/**
 * Get user profile using centralized API call
 * No need to pass token manually - apiCall handles it automatically
 */
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const data = await apiCall('/auth/me', {
      method: 'GET',
    });
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile';
    throw new Error(errorMessage);
  }
}

/**
 * Update user profile using centralized API call
 * Returns the updated user profile
 */
export async function updateUserProfile(
  data: Partial<Pick<UserProfile, "name" | "email" | "role">>
): Promise<UserProfile> {
  try {
    const result = await apiCall('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Handle different response formats from backend
    return result.user || result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
    throw new Error(errorMessage);
  }
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use the AuthContext getUserProfile method instead
 */
export async function getUserProfileWithToken(token: string): Promise<UserProfile> {
  console.warn('getUserProfileWithToken is deprecated. Use AuthContext getUserProfile instead.');
  
  // Temporarily store token and call new method
  const currentToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
  
  try {
    const profile = await getUserProfile();
    return profile;
  } finally {
    // Restore original token
    if (typeof window !== 'undefined') {
      if (currentToken) {
        localStorage.setItem('accessToken', currentToken);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }
}

/**
 * Legacy function - kept for backward compatibility  
 * @deprecated Use the AuthContext updateUserProfile method instead
 */
export async function updateUserProfileWithToken(
  token: string,
  data: Partial<Pick<UserProfile, "name" | "email" | "role">>
): Promise<UserProfile> {
  console.warn('updateUserProfileWithToken is deprecated. Use AuthContext updateUserProfile instead.');
  
  // Temporarily store token and call new method
  const currentToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
  
  try {
    const profile = await updateUserProfile(data);
    return profile;
  } finally {
    // Restore original token
    if (typeof window !== 'undefined') {
      if (currentToken) {
        localStorage.setItem('accessToken', currentToken);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }
}