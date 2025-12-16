/**
 * Projects API client
 * Handles CRUD operations for research projects
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

/**
 * Create headers for API requests
 * Tokens are in httpOnly cookies, no manual Authorization header needed
 * @returns {object}
 */
const getHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

/**
 * Get all projects for the current user
 * @returns {Promise<Array>}
 */
export const getProjects = async () => {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch projects: ${error.detail || `HTTP ${response.status}`}`);
  }

  return await response.json();
};

/**
 * Get a specific project by ID
 * @param {number} projectId - Project ID
 * @returns {Promise<object>}
 */
export const getProject = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch project: ${error.detail || `HTTP ${response.status}`}`);
  }

  return await response.json();
};

/**
 * Create a new project
 * @param {object} projectData - Project data {name, molecule_name, description}
 * @returns {Promise<object>}
 */
export const createProject = async (projectData) => {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(projectData)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create project');
  }

  return await response.json();
};

/**
 * Update an existing project
 * @param {number} projectId - Project ID
 * @param {object} projectData - Updated project data
 * @returns {Promise<object>}
 */
export const updateProject = async (projectId, projectData) => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(projectData)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to update project');
  }

  return await response.json();
};

/**
 * Delete a project
 * @param {number} projectId - Project ID
 * @returns {Promise<void>}
 */
export const deleteProject = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to delete project');
  }
};
