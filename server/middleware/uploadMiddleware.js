const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary with credentials from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Multer Storage engine hooked to Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'connect_green_businesses',
        allowedFormats: ['jpeg', 'png', 'jpg'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }]
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
