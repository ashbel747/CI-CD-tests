const API_BASE_URL = 'http://localhost:3000';

const refreshToken = async (): Promise<boolean> => {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) {
    return false;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (response.ok) {
      const tokens = await response.json();
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      return true;
    }
  } catch (err) {
    console.error('Token refresh failed', err);
  }
  return false;
};

// The core API call utility, now simplified for the caller
export const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(options.headers as object),
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If the token is unauthorized, try to refresh and re-run the request
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const newAccessToken = localStorage.getItem('accessToken');
      headers.Authorization = `Bearer ${newAccessToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      // If refresh failed, we can't proceed. Return an error response.
      return { ok: false, message: 'Authentication failed. Please log in again.' };
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API call to ${endpoint} failed with status ${response.status}`);
  }

  return data;
};
