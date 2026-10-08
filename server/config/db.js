const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // In local development or server environments, log error; don't unceremoniously kill process if in test/serverless
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
