export const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'no-photo.jpg') return '';

    // External URLs
    if (typeof imagePath === 'string' && imagePath.startsWith('http')) return imagePath;

    // Build backend origin from VITE_API_URL (prod) or localhost (dev)
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const backendOrigin = apiBase.replace(/\/api\/?$/, '');

    // Local uploads paths
    if (imagePath.startsWith('/')) return `${backendOrigin}${imagePath}`;
    return `${backendOrigin}/${imagePath}`;
};
