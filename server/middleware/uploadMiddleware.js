const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'connect_green_uploads',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            const error = new Error('Only JPEG, PNG, and WebP images are allowed.');
            error.status = 400;
            return callback(error);
        }
        callback(null, true);
    },
});

module.exports = upload;

