const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

if (process.env.NODE_ENV !== 'development' || !DEMO_PASSWORD) {
    throw new Error('Set NODE_ENV=development and DEMO_PASSWORD to run this demo login check.');
}

const testLogins = async () => {
    const accounts = [
        { email: 'admin@connectgreen.com', expectedRole: 'admin' },
        { email: 'business@connectgreen.com', expectedRole: 'business' },
        { email: 'sitemanager@connectgreen.com', expectedRole: 'siteManager' },
        { email: 'tourist@connectgreen.com', expectedRole: 'tourist' }
    ];

    console.log('Testing Login Flow for All Roles\n');
    console.log('=' .repeat(50));

    for (const account of accounts) {
        try {
            console.log(`\nTesting: ${account.email}`);
            const response = await axios.post(`${API_URL}/auth/login`, {
                email: account.email,
                password: DEMO_PASSWORD
            });
            
            const { role, name } = response.data;
            const status = role === account.expectedRole ? '✅ PASS' : '❌ FAIL';
            
            console.log(`  Name: ${name}`);
            console.log(`  Expected Role: ${account.expectedRole}`);
            console.log(`  Actual Role: ${role}`);
            console.log(`  Status: ${status}`);
            
        } catch (error) {
            console.log(`  ❌ ERROR: ${error.response?.data?.message || error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
};

testLogins();
