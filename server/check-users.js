const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function checkUsers() {
    let exitCode = 0;
    try {
        await mongoose.connect(MONGO_URI);
        const User = require('./models/User');
        const expectedRoles = {
            'admin@connectgreen.com': 'admin',
            'business@connectgreen.com': 'business',
            'sitemanager@connectgreen.com': 'siteManager',
            'tourist@connectgreen.com': 'tourist'
        };
        
        const users = await User.find({ email: { $in: Object.keys(expectedRoles) } }, 'email role').lean();
        let allCorrect = true;
        for (const [email, expectedRole] of Object.entries(expectedRoles)) {
            const user = users.find(u => u.email === email);
            if (!user) {
                console.log('A seeded demo account is missing.');
                allCorrect = false;
            } else if (user.role !== expectedRole) {
                console.log('A seeded demo account has an unexpected role.');
                allCorrect = false;
            }
        }
        
        if (allCorrect) {
            console.log('Seeded demo account roles are correct.');
        } else {
            console.log('Seeded demo accounts are missing or have incorrect roles.');
            exitCode = 1;
        }
    } catch (error) {
        console.error(`User check failed (${error.name || 'UnknownError'}).`);
        exitCode = 1;
    } finally {
        if (mongoose.connection.readyState) {
            await mongoose.disconnect();
        }
        process.exitCode = exitCode;
    }
}

checkUsers();
