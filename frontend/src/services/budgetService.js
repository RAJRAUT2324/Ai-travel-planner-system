/**
 * Budget Service — Axios POST to backend budget generation endpoint.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const budgetAPI = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

/**
 * Generate a budget plan via the backend AI service.
 * @param {Object} params - Budget form data
 * @returns {Promise} Axios response
 */
export const generateBudget = (params) =>
    budgetAPI.post('/budget/generate', params);

export default { generateBudget };
