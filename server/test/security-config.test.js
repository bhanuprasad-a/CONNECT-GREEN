const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSecurityConfig } = require('../config/security');

const validEnvironment = {
    NODE_ENV: 'production',
    JWT_SECRET: 'x'.repeat(48),
    MONGO_URI: 'mongodb://example.invalid/connect_green',
};

test('production requires explicit allowed origins', () => {
    assert.throws(
        () => loadSecurityConfig(validEnvironment),
        /ALLOWED_ORIGINS must be explicitly configured in production/
    );
});

test('production accepts only configured origins', () => {
    const config = loadSecurityConfig({
        ...validEnvironment,
        ALLOWED_ORIGINS: 'https://connect-green.example,https://admin.connect-green.example',
    });
    assert.deepEqual(config.allowedOrigins, [
        'https://connect-green.example',
        'https://admin.connect-green.example',
    ]);
});

test('production rejects insecure HTTP origins', () => {
    assert.throws(
        () => loadSecurityConfig({ ...validEnvironment, ALLOWED_ORIGINS: 'http://connect-green.example' }),
        /Production ALLOWED_ORIGINS must use HTTPS/
    );
});

test('wildcard origins are rejected', () => {
    assert.throws(
        () => loadSecurityConfig({ ...validEnvironment, ALLOWED_ORIGINS: '*' }),
        TypeError
    );
});

test('short or missing JWT secrets are rejected', () => {
    assert.throws(
        () => loadSecurityConfig({
            ...validEnvironment,
            JWT_SECRET: 'too-short',
            ALLOWED_ORIGINS: 'https://connect-green.example',
        }),
        /JWT_SECRET must be configured with at least 32 bytes/
    );
});