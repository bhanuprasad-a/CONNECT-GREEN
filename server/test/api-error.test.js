const test = require('node:test');
const assert = require('node:assert/strict');
const { respondWithApiError } = require('../utils/apiError');

const createResponse = () => ({
    statusCode: null,
    body: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    },
});

test('unexpected errors do not expose internal messages', () => {
    const response = createResponse();
    respondWithApiError(response, new Error('sensitive database URI'), 'test.operation');
    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.body, { message: 'An internal error occurred.' });
});

test('validation and duplicate-key errors map to safe client statuses', () => {
    const invalidResponse = createResponse();
    respondWithApiError(invalidResponse, Object.assign(new Error('private field details'), { name: 'ValidationError' }), 'test.validation');
    assert.equal(invalidResponse.statusCode, 400);
    assert.deepEqual(invalidResponse.body, { message: 'Invalid request data.' });

    const duplicateResponse = createResponse();
    respondWithApiError(duplicateResponse, Object.assign(new Error('private index details'), { code: 11000 }), 'test.duplicate');
    assert.equal(duplicateResponse.statusCode, 409);
    assert.deepEqual(duplicateResponse.body, { message: 'A record with these details already exists.' });
});