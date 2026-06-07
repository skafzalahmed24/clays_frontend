export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const BASE_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

export const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
