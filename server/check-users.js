// Debug script to check users in database
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB\n');
        
        // Get all users
        const User = require('./models/User');
        const users = await User.find({}, 'name email role');
        
        console.log('=== USERS IN DATABASE ===');
        console.log(`Total users: ${users.length}\n`);
        
        users.forEach(user => {
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log('---');
        });
        
        // Check if demo users exist with correct roles
        const expectedRoles = {
            'admin@connectgreen.com': 'admin',
            'business@connectgreen.com': 'business',
            'sitemanager@connectgreen.com': 'siteManager',
            'tourist@connectgreen.com': 'tourist'
        };
        
        console.log('\n=== VERIFICATION ===');
        let allCorrect = true;
        for (const [email, expectedRole] of Object.entries(expectedRoles)) {
            const user = users.find(u => u.email === email);
            if (!user) {
                console.log(`❌ ${email}: NOT FOUND`);
                allCorrect = false;
            } else if (user.role !== expectedRole) {
                console.log(`❌ ${email}: WRONG ROLE (expected ${expectedRole}, got ${user.role})`);
                allCorrect = false;
            } else {
                console.log(`✅ ${email}: ${user.role}`);
            }
        }
        
        if (allCorrect) {
            console.log('\n✅ All demo users have correct roles!');
        } else {
            console.log('\n⚠️  Some users have incorrect roles. Run seedAll.js to fix.');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkUsers();
