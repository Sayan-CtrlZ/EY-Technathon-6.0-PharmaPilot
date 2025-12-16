/**
 * Fetch Interceptor for automatic token refresh on 401 errors
 * Wraps the native fetch API to handle token expiration and refresh
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

let isRefreshing = false;
let refreshPromise = null;
let originalFetch = null; // keeps a stable reference to the native fetch

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem('access_token');
  return accessToken
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }
    : { 'Content-Type': 'application/json' };
};

/**
 * Perform the actual token refresh
 */
const performTokenRefresh = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    // Try sending refresh_token in body first, fallback to Authorization header
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    // store new tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Clear user session on refresh failure
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    throw error;
  }
};

/**
 * Wraps fetch to add automatic token refresh on 401
 */
export const fetchWithInterceptor = async (url, options = {}) => {
  // Skip refresh logic for auth endpoints that should surface raw errors
  const authBypass =
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh');

  const defaultOptions = {
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
    ...options,
  };

  const baseFetch = originalFetch || window.fetch; // use non-intercepted fetch

  let response = await baseFetch(url, defaultOptions);

  // If we get 401 (Unauthorized), try to refresh token
  if (response.status === 401 && !authBypass) {
    const hasRefresh = !!localStorage.getItem('refresh_token');
    if (!hasRefresh) {
      return response; // no refresh token; surface 401 to caller
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        refreshPromise = performTokenRefresh();
        await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;

        // Retry original request after token refresh with updated headers
        const retryHeaders = { ...getAuthHeaders(), ...(options.headers || {}) };
        response = await baseFetch(url, { ...defaultOptions, headers: retryHeaders });
      } catch (error) {
        isRefreshing = false;
        refreshPromise = null;
        throw error;
      }
    } else {
      // Wait for ongoing refresh to complete, then retry
      try {
        await refreshPromise;
        const retryHeaders = { ...getAuthHeaders(), ...(options.headers || {}) };
        response = await baseFetch(url, { ...defaultOptions, headers: retryHeaders });
      } catch (error) {
        throw error;
      }
    }
  }

  return response;
};

/**
 * Replace global fetch with our interceptor
 * Call this once when the app initializes
 */
export const initializeFetchInterceptor = () => {
  if (window.fetch === fetchWithInterceptor) {
    return () => {
      if (originalFetch) window.fetch = originalFetch;
    };
  }

  originalFetch = window.fetch;
  window.fetch = (...args) => fetchWithInterceptor(...args);

  // Return a function to restore original fetch if needed
  return () => {
    if (originalFetch) {
      window.fetch = originalFetch;
    }
  };
};
