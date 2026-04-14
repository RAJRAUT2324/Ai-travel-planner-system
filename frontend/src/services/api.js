/**
 * API Service Layer — centralized Axios instance with JWT interceptors.
 */

import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
    timeout: 120000,
});

// Request interceptor — attach JWT token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─── Auth ────────────────────────────────────────────
export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    getProfile: () => API.get('/auth/profile'),
    updateProfile: (data) => API.put('/auth/profile', data),
};

// ─── Destinations ────────────────────────────────────
export const destinationsAPI = {
    getAll: (params) => API.get('/destinations/', { params }),
    getAllSimple: () => API.get('/destinations/all'),
    getById: (id) => API.get(`/destinations/${id}`),
    create: (data) => API.post('/destinations/', data),
    update: (id, data) => API.put(`/destinations/${id}`, data),
    delete: (id) => API.delete(`/destinations/${id}`),
    getSimilar: (id) => API.get(`/destinations/${id}/similar`),
    getImageUrl: (imageId) => `/api/destinations/image/${imageId}`,
};

// ─── Reviews ─────────────────────────────────────────
export const reviewsAPI = {
    getByDestination: (destId) => API.get(`/reviews/destination/${destId}`),
    create: (data) => API.post('/reviews/', data),
    getAll: () => API.get('/reviews/all'),
    delete: (id) => API.delete(`/reviews/${id}`),
};

// ─── Itinerary ───────────────────────────────────────
export const itineraryAPI = {
    generate: (data) => API.post('/itinerary/generate', data),
    suggest: (data) => API.post('/itinerary/suggest', data),
    getHistory: () => API.get('/itinerary/history'),
    getById: (id) => API.get(`/itinerary/${id}`),
    downloadPdf: (id) => API.get(`/itinerary/${id}/pdf`, { responseType: 'blob' }),
};

// ─── Weather ─────────────────────────────────────────
export const weatherAPI = {
    getWeather: (city) => API.get('/weather/', { params: { city } }),
};

// ─── Admin ───────────────────────────────────────────
export const adminAPI = {
    // Stats & Analytics
    getStats: () => API.get('/admin/stats'),
    getMostSearched: () => API.get('/admin/analytics/searches'),
    getPopularTags: () => API.get('/admin/analytics/tags'),
    getRecentActivity: () => API.get('/admin/analytics/activity'),
    getAnalyticsOverview: () => API.get('/admin/analytics/overview'),

    // Users
    getUsers: () => API.get('/admin/users'),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
    toggleBan: (id) => API.put(`/admin/users/${id}/ban`),
    setUserRole: (id, data) => API.put(`/admin/users/${id}/role`, data),

    // Destinations
    getDestinations: () => API.get('/admin/destinations'),
    deleteDestination: (id) => API.delete(`/admin/destinations/${id}`),
    toggleFeatured: (id) => API.post(`/admin/destinations/${id}/feature`),
    getFeatured: () => API.get('/admin/featured'),

    // Reviews
    getReviews: () => API.get('/admin/reviews'),
    deleteReview: (id) => API.delete(`/admin/reviews/${id}`),

    // Itineraries
    getItineraries: () => API.get('/admin/itineraries'),
    deleteItinerary: (id) => API.delete(`/admin/itineraries/${id}`),
};

// ─── Chat ────────────────────────────────────────────
export const chatAPI = {
    sendMessage: (data) => API.post('/agent/', data),
};

export default API;
