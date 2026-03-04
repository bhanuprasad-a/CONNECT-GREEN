/**
 * CONNECT GREEN — Master Seed Script
 * Matches the EXACT Mongoose schemas in /models/
 *
 * Run from: c:\Users\Arya\CONNECT_GREEN\server
 *   node seedAll.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Business = require('./models/Business');
const NatureSite = require('./models/NatureSite');
const RecyclingCenter = require('./models/RecyclingCenter');
const CarbonOffset = require('./models/CarbonOffset');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env — aborting');
    process.exit(1);
}

/* ─────────────────── SEED DATA ─────────────────── */

// Demo users for testing different roles
const DEMO_USERS = [
    { 
        name: 'Demo Admin', 
        email: 'admin@connectgreen.com', 
        password: 'Connect@123', 
        role: 'admin' 
    },
    { 
        name: 'Demo Business', 
        email: 'business@connectgreen.com', 
        password: 'Connect@123', 
        role: 'business' 
    },
    { 
        name: 'Demo Site Manager', 
        email: 'sitemanager@connectgreen.com', 
        password: 'Connect@123', 
        role: 'siteManager' 
    },
    { 
        name: 'Demo Tourist', 
        email: 'tourist@connectgreen.com', 
        password: 'Connect@123', 
        role: 'tourist' 
    }
];

const businesses = [
    { name: 'The Green Leaf Cafe', category: 'restaurant', location: 'Banjara Hills, Hyderabad', description: 'Solar-powered cafe using 100% organic local produce.', badgeStatus: 'gold', lat: 17.4126, lng: 78.4482, isVerified: true, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' },
    { name: 'EcoStay Madhapur', category: 'hotel', location: 'Madhapur, Hyderabad', description: 'Zero-waste hotel with rainwater harvesting.', badgeStatus: 'silver', lat: 17.4380, lng: 78.3890, isVerified: true, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
    { name: 'Solar Eats Jubilee', category: 'restaurant', location: 'Jubilee Hills, Hyderabad', description: 'Restaurant powered entirely by rooftop solar panels.', badgeStatus: 'gold', lat: 17.4343, lng: 78.4062, isVerified: true, image: 'https://images.unsplash.com/photo-1555396273-357c7998b454?w=800' },
    { name: 'BioHotel Gachibowli', category: 'hotel', location: 'Gachibowli, Hyderabad', description: 'Eco-certified hotel with EV charging stations.', badgeStatus: 'bronze', lat: 17.4401, lng: 78.3489, isVerified: true, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe7fa?w=800' },
    { name: 'Green Wheels Transit', category: 'transport', location: 'Secunderabad, Hyderabad', description: 'Electric vehicle taxi fleet reducing city emissions.', badgeStatus: 'gold', lat: 17.4356, lng: 78.4987, isVerified: true, image: 'https://images.unsplash.com/photo-1593941707882-a5bac6841c82?w=800' },
    { name: 'Organic Bites Koramangala', category: 'restaurant', location: 'Koramangala, Bengaluru', description: 'Farm-to-table restaurant sourcing only local organic produce.', badgeStatus: 'silver', lat: 12.9352, lng: 77.6245, isVerified: true, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
    { name: 'EcoInn Whitefield', category: 'hotel', location: 'Whitefield, Bengaluru', description: 'LEED-certified green building with solar energy.', badgeStatus: 'gold', lat: 12.9698, lng: 77.7500, isVerified: true, image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083761?w=800' },
    { name: 'Clean Commute Delhi', category: 'transport', location: 'Connaught Place, New Delhi', description: 'CNG and electric public transport aggregator.', badgeStatus: 'silver', lat: 28.6315, lng: 77.2167, isVerified: true, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800' },
    { name: 'Eco Dine Mumbai', category: 'restaurant', location: 'Lower Parel, Mumbai', description: 'Plant-based menu with composting and zero plastic policy.', badgeStatus: 'bronze', lat: 19.0021, lng: 72.8378, isVerified: true, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' },
    { name: 'Vijayawada Green Resto', category: 'restaurant', location: 'Governorpet, Vijayawada', description: 'Local organic food with solar cooking appliances.', badgeStatus: 'silver', lat: 16.5062, lng: 80.6480, isVerified: true, image: 'https://images.unsplash.com/photo-1555396273-357c7998b454?w=800' },
    { name: 'Tirupati Eco Lodge', category: 'hotel', location: 'Tirupati, Andhra Pradesh', description: 'Eco-friendly accommodation near temple with solar power.', badgeStatus: 'gold', lat: 13.6288, lng: 79.4192, isVerified: true, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
    { name: 'Guntur Organic Hub', category: 'restaurant', location: 'Guntur, Andhra Pradesh', description: 'Traditional Andhra cuisine with farm-fresh organic ingredients.', badgeStatus: 'silver', lat: 16.3066, lng: 80.4365, isVerified: true, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
];

// NatureSite schema: manager(ObjectId), name, location(String), maxCapacity, currentVisitors, status, image
const natureSites = [
    // Vijayawada and surrounding natural sites with better photos
    { name: 'Kondapalli Fort', location: 'Kondapalli, Vijayawada', maxCapacity: 300, currentVisitors: 180, image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80' },
    { name: 'Bhavani Island', location: 'Krishna River, Vijayawada', maxCapacity: 200, currentVisitors: 200, image: 'https://images.unsplash.com/photo-1540202404-1b927e77f019?w=800' },
    { name: 'Mangalagiri Hills', location: 'Mangalagiri, Vijayawada', maxCapacity: 150, currentVisitors: 60, image: 'https://images.unsplash.com/photo-1596428232159-71d2de7641db?w=800' },
    { name: 'Undavalli Caves', location: 'Undavalli, Vijayawada', maxCapacity: 100, currentVisitors: 45, image: 'https://images.unsplash.com/photo-1605649673351-35d7b5b2f4d7?w=800' },
    { name: 'Kanaka Durga Temple Hill', location: 'Indrakeeladri, Vijayawada', maxCapacity: 500, currentVisitors: 350, image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800' },
    { name: 'Prakasam Barrage', location: 'Krishna River, Vijayawada', maxCapacity: 250, currentVisitors: 80, image: 'https://images.unsplash.com/photo-1549470987-9bb16ab3ac6c?w=800' },
    // Other existing sites with better photos
    { name: 'Nagarjunasagar Sanctuary', location: 'Nalgonda, Telangana', maxCapacity: 500, currentVisitors: 120, image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800' },
    { name: 'Mrugavani National Park', location: 'Gandipet, Hyderabad', maxCapacity: 300, currentVisitors: 230, image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800' },
    { name: 'Kanha Tiger Reserve', location: 'Mandla, Madhya Pradesh', maxCapacity: 400, currentVisitors: 80, image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800' },
    { name: 'Sundarbans Mangroves', location: 'West Bengal', maxCapacity: 250, currentVisitors: 195, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' },
    { name: 'Kaziranga National Park', location: 'Assam', maxCapacity: 600, currentVisitors: 100, image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800' },
    { name: 'Bandipur Tiger Reserve', location: 'Chamarajanagar, Karnataka', maxCapacity: 350, currentVisitors: 60, image: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800' },
    { name: 'Bhavani Island Park', location: 'Vijayawada, Andhra Pradesh', maxCapacity: 200, currentVisitors: 50, image: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=800' },
];

// RecyclingCenter schema: name, location(GeoJSON Point), acceptedWaste[], operatingHours, isOpen, address
const recyclingCenters = [
    { name: 'Vijayawada Green Drop Hub', address: 'Governorpet, Vijayawada', acceptedWaste: ['plastic', 'paper', 'glass', 'cardboard'], isOpen: true, operatingHours: { open: '07:00', close: '19:00' }, lat: 16.5062, lng: 80.6480 },
    { name: 'Benz Circle E-Recycle', address: 'Benz Circle, Vijayawada', acceptedWaste: ['e-waste', 'batteries', 'metal'], isOpen: true, operatingHours: { open: '09:00', close: '18:00' }, lat: 16.5193, lng: 80.6305 },
    { name: 'Patamata EcoRecycler', address: 'Patamata, Vijayawada', acceptedWaste: ['plastic', 'organic', 'glass'], isOpen: false, operatingHours: { open: '08:00', close: '15:00' }, lat: 16.5002, lng: 80.6622 },
    { name: 'Siddhartha Nagar Waste Hub', address: 'Siddhartha Nagar, Vijayawada', acceptedWaste: ['metal', 'cardboard', 'paper'], isOpen: true, operatingHours: { open: '06:30', close: '21:00' }, lat: 16.5161, lng: 80.6558 },
    { name: 'AG Colony Clean Centre', address: 'AG Colony, Vijayawada', acceptedWaste: ['e-waste', 'batteries', 'plastic'], isOpen: true, operatingHours: { open: '10:00', close: '20:00' }, lat: 16.5302, lng: 80.6200 },
    { name: 'Guntur EcoSort Station', address: 'Arundalpet, Guntur', acceptedWaste: ['plastic', 'glass', 'paper', 'organic'], isOpen: true, operatingHours: { open: '07:30', close: '18:30' }, lat: 16.3067, lng: 80.4365 },
    { name: 'Brodipet TechCycle', address: 'Brodipet, Guntur', acceptedWaste: ['e-waste', 'batteries', 'metal'], isOpen: true, operatingHours: { open: '09:00', close: '17:30' }, lat: 16.3028, lng: 80.4510 },
    { name: 'Naaz Centre Eco Drop', address: 'Naaz Centre, Guntur', acceptedWaste: ['plastic', 'cardboard', 'paper'], isOpen: false, operatingHours: { open: '08:00', close: '14:00' }, lat: 16.3090, lng: 80.4280 },
    { name: 'Guntur Metal & Glass Hub', address: 'Kothapet, Guntur', acceptedWaste: ['metal', 'glass', 'batteries'], isOpen: true, operatingHours: { open: '06:00', close: '20:00' }, lat: 16.2997, lng: 80.4600 },
    { name: 'Pattabhipuram Recycle Point', address: 'Pattabhipuram, Guntur', acceptedWaste: ['organic', 'plastic', 'paper', 'glass'], isOpen: true, operatingHours: { open: '08:00', close: '19:00' }, lat: 16.3150, lng: 80.4420 },
    { name: 'Hyderabad Eco Center', address: 'Banjara Hills, Hyderabad', acceptedWaste: ['plastic', 'glass', 'paper', 'cardboard'], isOpen: true, operatingHours: { open: '08:00', close: '19:00' }, lat: 17.3850, lng: 78.4867 },
    { name: 'TechCycle Madhapur', address: 'Madhapur, Hyderabad', acceptedWaste: ['e-waste', 'batteries', 'metal'], isOpen: true, operatingHours: { open: '09:00', close: '18:00' }, lat: 17.4410, lng: 78.3489 },
    { name: 'Delhi Eco Center', address: 'Connaught Place, New Delhi', acceptedWaste: ['plastic', 'paper', 'glass', 'cardboard'], isOpen: true, operatingHours: { open: '08:00', close: '20:00' }, lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai Circular Hub', address: 'Lower Parel, Mumbai', acceptedWaste: ['plastic', 'metal', 'glass', 'paper'], isOpen: true, operatingHours: { open: '07:00', close: '21:00' }, lat: 19.0760, lng: 72.8777 },
    { name: 'Hasiru Dala Bengaluru', address: 'Koramangala, Bengaluru', acceptedWaste: ['organic', 'plastic', 'paper'], isOpen: true, operatingHours: { open: '08:00', close: '18:00' }, lat: 12.9716, lng: 77.5946 },
];

// CarbonOffset schema: name, organization, description, type(enum), costPerKg, image, location(String)
const carbonOffsets = [
    // Andhra Pradesh specific projects
    { name: 'Kolleru Lake Restoration', organization: 'Andhra Pradesh Wetlands Authority', description: 'Restoring the largest freshwater lake in India, protecting migratory birds and aquatic biodiversity while capturing carbon through mangrove regeneration.', type: 'reforestation', costPerKg: 10, location: 'Andhra Pradesh', image: 'https://images.unsplash.com/photo-1540202404-1b927e77f019?w=800' },
    { name: 'Krishna River Solar Canal Project', organization: 'AP Renewable Energy Corporation', description: 'Installing solar panels over irrigation canals in Krishna basin to generate clean energy while reducing water evaporation.', type: 'renewable', costPerKg: 8, location: 'Andhra Pradesh', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800' },
    { name: 'Vijayawada Urban Forestry', organization: 'Green Vijayawada Initiative', description: 'Planting native tree species along the banks of Krishna River and in urban areas to combat air pollution and sequester carbon.', type: 'reforestation', costPerKg: 6, location: 'Andhra Pradesh', image: 'https://images.unsplash.com/photo-1549470987-9bb16ab3ac6c?w=800' },
    { name: 'Andhra Pradesh Mangrove Conservation', organization: 'Coastal Andhra Conservation Trust', description: 'Protecting and expanding mangrove forests along the Bay of Bengal coastline, crucial for carbon sequestration and coastal protection.', type: 'reforestation', costPerKg: 12, location: 'Andhra Pradesh', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' },
    { name: 'Tirupati Wind Farm', organization: 'AP Green Energy Ltd', description: 'Developing wind energy projects in the Tirupati region to displace coal power and create sustainable energy for temple operations.', type: 'renewable', costPerKg: 7, location: 'Andhra Pradesh', image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800' },
    { name: 'Organic Farming Transition Anantapur', organization: 'Anantapur Organic Farmers Collective', description: 'Helping farmers transition from chemical to organic agriculture, reducing emissions and improving soil carbon sequestration.', type: 'community_project', costPerKg: 5, location: 'Andhra Pradesh', image: 'https://images.unsplash.com/photo-1592924357228-91a4daad63a8?w=800' },
    // Other Indian states projects
    { name: 'Himalayan Agroforestry', organization: 'GreenIndia Trust', description: 'Planting diverse tree species on degraded Himalayan slopes to restore watersheds in Uttarakhand and Himachal Pradesh.', type: 'reforestation', costPerKg: 9, location: 'Uttarakhand', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800' },
    { name: 'Gujarat Wind Farm', organization: 'CleanWind Asia', description: 'Wind energy displacing coal in Western India, powering thousands of rural homes in Gujarat.', type: 'renewable', costPerKg: 7, location: 'Gujarat', image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800' },
    { name: 'Rajasthan Solar Park', organization: 'Solar Energy Corporation of India', description: 'Large-scale solar installations in the Thar Desert, harnessing abundant sunlight for clean energy generation.', type: 'renewable', costPerKg: 6, location: 'Rajasthan', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800' },
    { name: 'Sundarbans Mangrove Protection', organization: 'West Bengal Forest Department', description: 'Conserving the world\'s largest mangrove forest, protecting Bengal tigers while sequestering massive amounts of carbon.', type: 'reforestation', costPerKg: 11, location: 'West Bengal', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' },
    { name: 'Kerala Backwater Conservation', organization: 'Kerala Biodiversity Board', description: 'Protecting and restoring the intricate network of lakes, canals and lagoons while promoting sustainable tourism.', type: 'community_project', costPerKg: 8, location: 'Kerala', image: 'https://images.unsplash.com/photo-1540202404-1b927e77f019?w=800' },
    { name: 'Tamil Nadu Clean Cookstoves', organization: 'Rural Energy Foundation', description: 'Distributing energy-efficient cookstoves to rural households, reducing wood consumption and indoor air pollution.', type: 'community_project', costPerKg: 6, location: 'Tamil Nadu', image: 'https://images.unsplash.com/photo-1505230833131-0f3062678665?w=800' },
    { name: 'Karnataka Bamboo Cultivation', organization: 'Bamboo India Initiative', description: 'Promoting bamboo plantations as fast-growing carbon sinks while providing sustainable livelihoods for farmers.', type: 'reforestation', costPerKg: 7, location: 'Karnataka', image: 'https://images.unsplash.com/photo-1549470987-9bb16ab3ac6c?w=800' },
    { name: 'Maharashtra Metro Electrification', organization: 'Mumbai Metro Green Fund', description: 'Expanding electric metro networks to reduce urban transport emissions and congestion.', type: 'renewable', costPerKg: 7, location: 'Maharashtra', image: 'https://images.unsplash.com/photo-1593941707882-a5bac6841c82?w=800' },
];

/* ─────────────────── RUN SEEDER ─────────────────── */
const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // ── 2. Clear collections (including users to ensure fresh roles)
        await Promise.all([
            User.deleteMany(),
            Business.deleteMany(),
            NatureSite.deleteMany(),
            RecyclingCenter.deleteMany(),
            CarbonOffset.deleteMany(),
        ]);
        console.log('🗑  Cleared: users, businesses, naturesites, recyclingcenters, carbonoffsets\n');

        // ── 1. Create demo users for testing different roles (after clearing)
        let createdUsers = [];
        for (const demoUser of DEMO_USERS) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(demoUser.password, salt);
            const existingUser = await User.create({ 
                ...demoUser, 
                password: hashedPassword 
            });
            console.log(`✅ Created demo ${demoUser.role}: ${demoUser.email} / ${demoUser.password}`);
            createdUsers.push(existingUser);
        }
        
        // Get the admin user for assigning as owner/manager
        const adminUser = createdUsers.find(u => u.role === 'admin');

        // ── 3. Seed Businesses with GeoJSON location (inject owner FK)
        const bizDocs = businesses.map(b => ({
            name: b.name,
            category: b.category,
            location: b.location,
            description: b.description,
            badgeStatus: b.badgeStatus,
            isVerified: b.isVerified,
            image: b.image,
            owner: adminUser._id,
            lat: b.lat,
            lng: b.lng,
            // GeoJSON for map queries
            geoLocation: {
                type: 'Point',
                coordinates: [b.lng, b.lat],
            }
        }));
        await Business.insertMany(bizDocs);
        console.log(`✅ Seeded ${businesses.length} Businesses with Geo coordinates`);

        // ── 4. Seed Nature Sites with GeoJSON location (inject manager FK)
        const siteDocs = natureSites.map(s => ({
            name: s.name,
            location: s.location,
            maxCapacity: s.maxCapacity,
            currentVisitors: s.currentVisitors,
            image: s.image,
            manager: adminUser._id,
            lat: s.lat,
            lng: s.lng,
            // GeoJSON for map queries
            geoLocation: {
                type: 'Point',
                coordinates: [s.lng, s.lat],
            }
        }));
        await NatureSite.insertMany(siteDocs);
        console.log(`✅ Seeded ${natureSites.length} Nature Sites with Geo coordinates`);

        // ── 5. Seed Recycling Centers (requires GeoJSON location)
        const centerDocs = recyclingCenters.map(c => ({
            name: c.name,
            address: c.address,
            acceptedWaste: c.acceptedWaste,
            isOpen: c.isOpen,
            operatingHours: c.operatingHours,
            location: {
                type: 'Point',
                coordinates: [c.lng, c.lat],  // MongoDB GeoJSON: [longitude, latitude]
            },
        }));
        await RecyclingCenter.insertMany(centerDocs);
        console.log(`✅ Seeded ${recyclingCenters.length} Recycling Centers`);

        // ── 6. Seed Carbon Offsets
        await CarbonOffset.insertMany(carbonOffsets);
        console.log(`✅ Seeded ${carbonOffsets.length} Carbon Offset Projects`);

        console.log('\n🌿 ─────────────────────────────────────────');
        console.log('   All data seeded successfully!');
        console.log('   Demo login credentials:');
        console.log('   • Admin: admin@connectgreen.com / Connect@123');
        console.log('   • Business: business@connectgreen.com / Connect@123');
        console.log('   • Site Manager: sitemanager@connectgreen.com / Connect@123');
        console.log('   • Tourist: tourist@connectgreen.com / Connect@123');
        console.log('─────────────────────────────────────────────\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Seeding failed:', err.message);
        if (err.errors) {
            Object.entries(err.errors).forEach(([field, e]) => {
                console.error(`   • ${field}: ${e.message}`);
            });
        }
        process.exit(1);
    }
};

seed();
