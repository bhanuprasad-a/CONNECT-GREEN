const DEVELOPMENT_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:5173',
];

const parseOrigins = (value) => {
    if (!value) {
        return [];
    }

    return value.split(',').map((origin) => {
        const normalized = origin.trim();
        const parsed = new URL(normalized);
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== normalized) {
            throw new Error('ALLOWED_ORIGINS must contain valid origins without paths.');
        }
        return parsed.origin;
    });
};

const loadSecurityConfig = (env = process.env) => {
    const isProduction = env.NODE_ENV === 'production';
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret || Buffer.byteLength(jwtSecret, 'utf8') < 32) {
        throw new Error('JWT_SECRET must be configured with at least 32 bytes.');
    }
    if (!env.MONGO_URI) {
        throw new Error('MONGO_URI must be configured.');
    }

    const configuredOrigins = parseOrigins(env.ALLOWED_ORIGINS || env.FRONTEND_URL);
    if (isProduction && configuredOrigins.length === 0) {
        throw new Error('ALLOWED_ORIGINS must be explicitly configured in production.');
    }
    if (isProduction && configuredOrigins.some((origin) => !origin.startsWith('https://'))) {
        throw new Error('Production ALLOWED_ORIGINS must use HTTPS.');
    }

    return {
        allowedOrigins: configuredOrigins.length > 0 ? configuredOrigins : DEVELOPMENT_ORIGINS,
    };
};

module.exports = { loadSecurityConfig };