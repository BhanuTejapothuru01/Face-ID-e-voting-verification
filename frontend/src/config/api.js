// Centralized API Base URL configuration for FaceVote
// Prefers VITE_API_URL environment variable if set.
// On production deployments, defaults to Render backend at https://face-id-e-voting-verification.onrender.com
// On local dev server (localhost / 127.0.0.1), defaults to http://127.0.0.1:8000.

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (isLocalhost ? 'http://127.0.0.1:8000' : 'https://face-id-e-voting-verification.onrender.com');
