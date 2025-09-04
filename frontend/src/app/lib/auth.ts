const API_BASE_URL = 'http://localhost:3000'; // Adjust to your NestJS port

// Token management (SSR-safe)
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const getUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId');
  }
  return null;
};

export const removeTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  }
};

export const isLoggedIn = (): boolean => {
  return !!getAccessToken();
};

// API call with automatic token refresh
export const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = getAccessToken();
  
  // Add authorization header if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If token expired, try to refresh
  if (response.status === 401 && accessToken) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const tokens = await refreshResponse.json();
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
          }

          // Retry original request with new token
          return fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          });
        }
      } catch (error) {
        // Refresh failed, redirect to login
        removeTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
  }

  return response;
};

// Logout function
export const logout = (): void => {
  removeTokens();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Check if user is authenticated (for protected routes)
export const requireAuth = (): boolean => {
  if (typeof window !== 'undefined' && !isLoggedIn()) {
    window.location.href = '/login';
    return false;
  }
  return true;
};

// Hook for checking auth status in components
export const useAuth = () => {
  const checkAuth = () => {
    return isLoggedIn();
  };

  const logoutUser = () => {
    logout();
  };

  return {
    isAuthenticated: checkAuth(),
    userId: getUserId(),
    logout: logoutUser,
  };
};