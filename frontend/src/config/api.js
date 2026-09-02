// Centralized API Base URL configuration
// Prefers VITE_API_URL environment variable if set, otherwise defaults to local backend at http://127.0.0.1:8000
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
