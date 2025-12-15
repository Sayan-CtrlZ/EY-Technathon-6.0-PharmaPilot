/**
 * ResponseGenerator utility
 * Handles generating AI responses from backend API
 */

// Hardcode URL to strictly valid localhost to avoid ANY configuration or environment issues
const API_URL = 'http://localhost:5001/api/v1';

/**
 * Generate AI response from backend API
 * @param {string} prompt - User's input prompt
 * @param {AbortSignal} [signal] - Optional abort signal to cancel request
 * @returns {Promise<{content: string, charts: Array, pdf: string}>} Response
 */
export const generateResponse = async (prompt, signal) => {
  try {
    // Use regular fetch - the global fetch is already intercepted
    // We use the passed signal OR create a default timeout one
    let requestSignal = signal;
    let timeoutId = null;

    if (!requestSignal) {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min default
      requestSignal = controller.signal;
    }

    const response = await fetch(`${API_URL}/chat/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      signal: requestSignal,
      body: JSON.stringify({
        prompt,
        session_id: 1 // Will be dynamic based on session
      })
    });

    if (timeoutId) clearTimeout(timeoutId); // Clear timeout on success

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate response');
    }

    const data = await response.json();
    return {
      content: data.content || data.response || '',
      charts: data.charts || [],
      pdf: data.report_pdf || null
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};
