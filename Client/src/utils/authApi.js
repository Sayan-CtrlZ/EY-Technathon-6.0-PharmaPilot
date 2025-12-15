/**
 * Authentication API client
 * Handles user registration, login, token refresh, and logout
 */

// Hardcode URL to strictly valid localhost to avoid ANY configuration or environment issues
const API_URL = 'http://localhost:5001/api/v1';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} fullName - User full name
 * @param {string} password - User password (min 8 characters)
 * @returns {Promise<{id, email, full_name, role, is_active, created_at, updated_at}>}
 */
export const registerUser = async (email, fullName, password) => {
  console.log('Registering with API URL:', API_URL); // Debug log
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Include cookies for CORS
    body: JSON.stringify({
      email,
      full_name: fullName,
      password,
      role: 'researcher'
    })
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      detail = error.detail || detail;
    } catch { }
    throw new Error(detail);
  }

  return await response.json();
};

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{access_token, refresh_token, token_type}>}
 */
export const loginUser = async (email, password) => {
  console.log('Logging in to:', `${API_URL}/auth/login`); // Debug log
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  const data = await response.json();

  // Store tokens in localStorage for prototype
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);

  return data;
};

/**
 * Request a password reset link to be emailed to the user
 * @param {string} email - User email
 * @returns {Promise<{detail: string}>}
 */
export const requestPasswordReset = async (email) => {
  console.log('API_URL:', API_URL);
  console.log('Requesting password reset for:', email);

  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      detail = error.detail || detail;
    } catch { }
    console.error('Password reset failed:', detail);
    throw new Error(detail);
  }

  const data = await response.json();
  console.log('Password reset success:', data);
  return data;
};

/**
 * Get current user information
 * @returns {Promise<{id, email, full_name, role, is_active, created_at, updated_at}>}
 */
export const getCurrentUser = async () => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      detail = error.detail || detail;
    } catch { }
    throw new Error(`Failed to fetch user info: ${detail}`);
  }

  return await response.json();
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();

  // Update tokens in localStorage
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  if (data.refresh_token) {
    localStorage.setItem('refresh_token', data.refresh_token);
  }

  return data;
};

/**
 * Logout user by clearing localStorage
 */
export const logoutUser = async () => {
  // Clear all auth data from localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Reset password using reset token from email
 * @param {string} token - Password reset token from email link
 * @param {string} newPassword - New password
 * @returns {Promise<{detail: string}>}
 */
export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token, new_password: newPassword })
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      detail = error.detail || detail;
    } catch { }
    throw new Error(detail);
  }

  return await response.json();
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};
