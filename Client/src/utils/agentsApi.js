/**
 * AI Agents API client
 * Handles AI agent execution and logging
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
 * Execute an AI agent
 * @param {number} projectId - Project ID
 * @param {string} agentType - Type of agent (e.g., 'patent_analysis', 'market_research', 'competitor_analysis')
 * @param {string} inputText - Input text for the agent
 * @returns {Promise<object>}
 */
export const executeAgent = async (projectId, agentType, inputText) => {
  const response = await fetch(`${API_URL}/agents/execute`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      project_id: projectId,
      agent_type: agentType,
      input_text: inputText
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to execute agent');
  }

  return await response.json();
};

/**
 * Get all agent logs for the current user
 * @param {number} projectId - Optional: Filter by project ID
 * @returns {Promise<Array>}
 */
export const getAgentLogs = async (projectId = null) => {
  let url = `${API_URL}/agents/logs`;
  if (projectId) {
    url += `?project_id=${projectId}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch agent logs: ${error.detail || `HTTP ${response.status}`}`);
  }

  return await response.json();
};

/**
 * Get a specific agent log by ID
 * @param {number} logId - Log ID
 * @returns {Promise<object>}
 */
export const getAgentLog = async (logId) => {
  const response = await fetch(`${API_URL}/agents/logs/${logId}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch agent log');
  }

  return await response.json();
};
