const test = require('node:test');
const assert = require('node:assert/strict');
const { getRegistrationRole } = require('../utils/registrationRole');

test('public registration permits only tourist and business roles', () => {
    assert.equal(getRegistrationRole('tourist'), 'tourist');
    assert.equal(getRegistrationRole('business'), 'business');
    assert.equal(getRegistrationRole('siteManager'), null);
    assert.equal(getRegistrationRole('admin'), null);
    assert.equal(getRegistrationRole(undefined), 'tourist');
});