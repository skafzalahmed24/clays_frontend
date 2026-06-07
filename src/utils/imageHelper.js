import { BASE_URL } from './apiConfig';

export const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) return imagePath; // External, Data, or Blob URL
    
    // Check if it's a local asset (Vite)
    if (imagePath.startsWith('/src') || imagePath.startsWith('/assets')) return imagePath;

    // Assuming it's from our backend (uploads), use centralized BASE_URL
    
    // Ensure path starts with /
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${BASE_URL}${path}`;
};
