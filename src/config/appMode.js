export const APP_MODE = (import.meta.env.VITE_APP_MODE || 'all').trim().toLowerCase();
export const isPublicOnly = APP_MODE === 'public';
export const isAdminOnly = APP_MODE === 'admin';
