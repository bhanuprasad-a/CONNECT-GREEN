export const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'no-photo.jpg') return '';

    // External URLs
    if (typeof imagePath === 'string' && imagePath.startsWith('http')) return imagePath;

    // Relative URLs use the current origin in local development and same-origin deployments.
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    const backendOrigin = apiBase.replace(/\/api\/?$/, '');

    // Local uploads paths
    if (imagePath.startsWith('/')) return `${backendOrigin}${imagePath}`;
    return `${backendOrigin}/${imagePath}`;
};
