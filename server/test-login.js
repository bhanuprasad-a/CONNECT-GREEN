const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

const testLogins = async () => {
    const accounts = [
        { email: 'admin@connectgreen.com', password: 'Connect@123', expectedRole: 'admin' },
        { email: 'business@connectgreen.com', password: 'Connect@123', expectedRole: 'business' },
        { email: 'sitemanager@connectgreen.com', password: 'Connect@123', expectedRole: 'siteManager' },
        { email: 'tourist@connectgreen.com', password: 'Connect@123', expectedRole: 'tourist' }
    ];

    console.log('Testing Login Flow for All Roles\n');
    console.log('=' .repeat(50));

    for (const account of accounts) {
        try {
            console.log(`\nTesting: ${account.email}`);
            const response = await axios.post(`${API_URL}/auth/login`, {
                email: account.email,
                password: account.password
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
