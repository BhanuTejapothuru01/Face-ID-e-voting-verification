// Centralized API Base URL configuration for FaceVote
// Uses VITE_API_URL if explicitly set.
// On production deployments (e.g. Vercel same-domain /api/*), defaults to "" so relative calls work automatically without CORS.
// On local dev server (localhost / 127.0.0.1), defaults to http://127.0.0.1:8000.

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (isLocalhost ? 'http://127.0.0.1:8000' : '');
