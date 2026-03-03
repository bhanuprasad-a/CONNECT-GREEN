const mongoose = require('mongoose');
const CarbonOffset = require('./models/CarbonOffset');
const dotenv = require('dotenv');

dotenv.config();

const seedOffsets = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/connect_green');

        // Clear existing
        await CarbonOffset.deleteMany();

        const projects = [
            {
                name: 'Amazon Reforestation',
                organization: 'GreenEarth Foundation',
                description: 'Restoring native species in the Brazilian rainforest to capture carbon and protect biodiversity. This project focuses on the most vulnerable areas of the Amazon basin.',
                type: 'reforestation',
                costPerKg: 0.15,
                location: 'Brazil',
                image: 'https://images.unsplash.com/photo-1511497584788-8767fe771d21?w=800'
            },
            {
                name: 'Sahara Solar Farm',
                organization: 'SunFuture Energy',
                description: 'Developing massive solar arrays to displace coal-fired power plants across North Africa. Clean energy for thousands of homes.',
                type: 'renewable',
                costPerKg: 0.10,
                location: 'Morocco',
                image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'
            },
            {
                name: 'Kenyan Clean Cookstoves',
                organization: 'Global Health & Climate',
                description: 'Providing energy-efficient cookstoves to rural communities, reducing wood consumption and methane emissions while improving air quality.',
                type: 'community_project',
                costPerKg: 0.08,
                location: 'Kenya',
                image: 'https://images.unsplash.com/photo-1505230833131-0f3062678665?w=800'
            }
        ];

        await CarbonOffset.insertMany(projects);
        console.log('Carbon Offset projects seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding offset projects:', error);
        process.exit(1);
    }
};

seedOffsets();
