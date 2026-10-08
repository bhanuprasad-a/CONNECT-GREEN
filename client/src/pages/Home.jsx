import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, BadgeCheck, Activity, Users, Globe, Leaf, Search, MapPin, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/getImageUrl';
import toast from 'react-hot-toast';
const features = [
    { icon: <Map size={32} />, title: 'Trip Planner', desc: 'Explore route options and indicative carbon estimates using map and routing data.' },
    { icon: <BadgeCheck size={32} />, title: 'Green Badge', desc: 'Browse the platform-admin review status submitted by listed businesses.' },
    { icon: <Activity size={32} />, title: 'Carbon Estimates', desc: 'Review indicative trip estimates based on route distance and selected listings.' },
    { icon: <Globe size={32} />, title: 'Nature Sites', desc: 'View site-manager-maintained capacity records; live sensor data is not connected.' },
    { icon: <Leaf size={32} />, title: 'Offset Demo', desc: 'Explore a sample offset catalog and record a demonstration contribution without payment.' }
];

const workflows = [
    { title: 'Plan a route', detail: 'Compare a mapped route with indicative emissions estimates.' },
    { title: 'Review a listing', detail: 'See a business profile, its platform review status, and community reviews.' },
    { title: 'Check site records', detail: 'View the latest visitor count entered by a site manager.' }
];

const Home = () => {
    const { user } = useContext(AuthContext);
    const [tripStats, setTripStats] = useState({ tripsCount: 0, savedPercent: 0, stdEmissions: 0, actEmissions: 0 });
    const [businesses, setBusinesses] = useState([]);
    const [natureSites, setNatureSites] = useState([]);
    const [platformStats, setPlatformStats] = useState({
        businessesCount: 0, 
        sitesCount: 0 
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch businesses and nature sites in parallel for minimum latency
                const [bizRes, sitesRes] = await Promise.all([
                    api.get('/businesses'),
                    api.get('/sites')
                ]);
                const bizData = bizRes.data || [];
                const sitesData = sitesRes.data || [];
                setBusinesses(bizData);
                setNatureSites(sitesData);

                setPlatformStats({
                    businessesCount: bizData.length,
                    sitesCount: sitesData.length
                });
            } catch {
                toast.error('Some directory data is currently unavailable.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchTrips = async () => {
            if (user && user.role === 'tourist') {
                try {
                    const res = await api.get('/trips');
                    const trips = Array.isArray(res.data) ? res.data : [];
                    if (trips.length > 0) {
                        let totalSavings = 0;
                        let totalDistance = 0;
                        trips.forEach(t => {
                            totalSavings += Number(t.carbonSaved) || 0;
                            totalDistance += Number(t.distanceKm) || 0;
                        });
                        const stdEmiss = totalDistance * 0.192;
                        const actEmiss = Math.max(0, stdEmiss - totalSavings);
                        const savedPct = stdEmiss > 0 ? Math.round((totalSavings / stdEmiss) * 100) : 0;
                        setTripStats({ tripsCount: trips.length, savedPercent: savedPct, stdEmissions: Math.round(stdEmiss), actEmissions: Math.round(actEmiss) });
                    }
                } catch (err) { }
            }
        };
        fetchTrips();
    }, [user]);

    const pieData = tripStats.tripsCount > 0
        ? [{ name: "Saved", value: tripStats.savedPercent }, { name: "Emitted", value: 100 - tripStats.savedPercent }]
        : [{ name: "Saved", value: 0 }, { name: "Emitted", value: 100 }];
    const reviewedBusinesses = businesses.filter((business) => business.isVerified);

    return (
        <div className="flex flex-col w-full text-stone-800">
            {/* HERO SECTION */}
            <section className="relative bg-darkBg text-white pt-12 pb-24 overflow-hidden border-b border-neonGreen/20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(34,197,94,0.15)_0%,transparent_60%)] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center relative z-10">
                    <div className="lg:w-[55%] pt-10 pb-16 lg:pr-12 text-center lg:text-left">

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight tracking-tight mb-6">
                            Travel Green.<br />
                            <span className="text-neonGreen">Live Smart.</span>
                        </h1>
                        <p className="text-lg text-stone-300 mb-10 max-w-xl mx-auto lg:mx-0">
                            A tourism project for exploring local business listings, route estimates, and manually maintained nature-site records.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-14">
                            <Link to="/planner" className="px-8 py-3.5 bg-neonGreen text-darkBg font-semibold rounded hover:bg-accentGreen transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] text-center">
                                Plan My Green Trip
                            </Link>
                            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-8 py-3.5 border border-neonGreen text-white font-semibold rounded hover:bg-neonGreen/10 transition-colors text-center cursor-pointer block sm:inline-block">
                                See How It Works
                            </a>
                        </div>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-8 border-t border-stone-800 pt-8">
                            <div>
                                <h3 className="text-3xl font-display font-bold text-white">{loading ? '—' : platformStats.businessesCount}</h3>
                                <p className="text-stone-400 text-sm">Business Listings</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-display font-bold text-white">{loading ? '—' : platformStats.sitesCount}</h3>
                                <p className="text-stone-400 text-sm">Nature Site Records</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-display font-bold text-white">—</h3>
                                <p className="text-stone-400 text-sm">Impact Not Measured</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-[45%] w-full h-80 sm:h-96 lg:h-[600px] mt-12 lg:mt-0 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-darkBg to-transparent z-10 w-24"></div>
                        <img
                            src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Sustainable Wind Turbine"
                            className="w-full h-full object-cover rounded-xl opacity-80"
                        />
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-24 bg-lightBg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-bold text-primaryGreen mb-4">Everything You Need for a Green Trip</h2>
                        <p className="text-stone-600 max-w-2xl mx-auto">Our holistic platform supports your entire journey, ensuring maximum positive impact on the environment and local communities.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feat, idx) => (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                key={idx}
                                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-[0_0_0_1.5px_#22C55E] transition-shadow duration-300"
                            >
                                <div className="w-14 h-14 bg-deepCard flex items-center justify-center rounded-xl text-neonGreen mb-6">
                                    {feat.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-primaryGreen">{feat.title}</h3>
                                <p className="text-stone-500 leading-relaxed">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-lightBg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-neonGreen font-semibold tracking-wider text-sm uppercase mb-3 block">Simple Process</span>
                        <h2 className="text-4xl font-display font-bold text-primaryGreen mb-4">How CONNECT GREEN Works</h2>
                        <p className="text-stone-600 max-w-2xl mx-auto">Three simple steps to sustainable travel. Our platform guides you from planning to impact tracking.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        {/* Step 1 */}
                        <div className="relative group">
                            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-neonGreen/30 h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-14 h-14 bg-neonGreen/10 rounded-xl flex items-center justify-center">
                                        <Search className="text-neonGreen" size={28} />
                                    </div>
                                    <span className="text-5xl font-display font-bold text-stone-100 group-hover:text-neonGreen/20 transition-colors">01</span>
                                </div>
                                <h3 className="text-xl font-semibold text-primaryGreen mb-3">Search Destination</h3>
                                <p className="text-stone-500 leading-relaxed text-sm">
                                    Enter a destination and explore route data and available business listings. Results depend on connected map services and saved records.
                                </p>
                                <div className="mt-6 pt-6 border-t border-stone-100">
                                    <div className="flex items-center gap-2 text-xs text-stone-400">
                                        <div className="w-2 h-2 rounded-full bg-neonGreen"></div>
                                        <span>Map-Based Route Estimates</span>
                                    </div>
                                </div>
                            </div>
                            {/* Connector line for desktop */}
                            <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-[2px] bg-gradient-to-r from-neonGreen/40 to-transparent"></div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative group">
                            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-neonGreen/30 h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-14 h-14 bg-neonGreen/10 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="text-neonGreen" size={28} />
                                    </div>
                                    <span className="text-5xl font-display font-bold text-stone-100 group-hover:text-neonGreen/20 transition-colors">02</span>
                                </div>
                                <h3 className="text-xl font-semibold text-primaryGreen mb-3">Choose Green Options</h3>
                                <p className="text-stone-500 leading-relaxed text-sm">
                                    Browse business submissions and their platform-admin review status. Reviews are not independent sustainability certification.
                                </p>
                                <div className="mt-6 pt-6 border-t border-stone-100">
                                    <div className="flex items-center gap-2 text-xs text-stone-400">
                                        <div className="w-2 h-2 rounded-full bg-neonGreen"></div>
                                        <span>Platform Badge Review</span>
                                    </div>
                                </div>
                            </div>
                            {/* Connector line for desktop */}
                            <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-[2px] bg-gradient-to-r from-neonGreen/40 to-transparent"></div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative group">
                            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-neonGreen/30 h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-14 h-14 bg-neonGreen/10 rounded-xl flex items-center justify-center">
                                        <Activity className="text-neonGreen" size={28} />
                                    </div>
                                    <span className="text-5xl font-display font-bold text-stone-100 group-hover:text-neonGreen/20 transition-colors">03</span>
                                </div>
                                <h3 className="text-xl font-semibold text-primaryGreen mb-3">Track Your Impact</h3>
                                <p className="text-stone-500 leading-relaxed text-sm">
                                    Review indicative carbon estimates from a planned route and selected listings. This prototype does not measure emissions in real time.
                                </p>
                                <div className="mt-6 pt-6 border-t border-stone-100">
                                    <div className="flex items-center gap-2 text-xs text-stone-400">
                                        <div className="w-2 h-2 rounded-full bg-neonGreen"></div>
                                        <span>Indicative Carbon Estimates</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center mt-12">
                        <Link to="/planner" className="inline-flex items-center gap-2 px-8 py-4 bg-neonGreen text-darkBg font-semibold rounded-xl hover:bg-accentGreen transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:-translate-y-1">
                            Start Planning Your Green Trip
                            <span className="text-lg">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* SITE CAPACITY MONITOR SHOWCASE */}
            <section className="py-24 bg-darkBg text-white border-t border-b border-neonGreen/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-neonGreen font-semibold tracking-wider text-sm mb-2 block uppercase">Manager-Maintained Site Records</span>
                        <h2 className="text-4xl font-display font-bold mb-6">Protect Ecosystems from Over-tourism</h2>
                        <p className="text-stone-300 text-lg leading-relaxed mb-8">
                            Site managers can record visitor counts and capacity. This prototype has no connected IoT sensors, and suggested alternatives are other site records rather than live traffic guidance.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-neonGreen" /> Recorded capacity status</li>
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-neonGreen" /> Alternative destination suggestions</li>
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-neonGreen" /> Site-manager updates</li>
                        </ul>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-neonGreen/10 rounded-2xl blur-xl"></div>
                        {loading ? (
                            <div className="bg-deepCard border border-stone-800 rounded-xl p-12 relative z-10 shadow-2xl text-center">
                                <div className="w-8 h-8 border-2 border-neonGreen border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-stone-400">Loading nature sites...</p>
                            </div>
                        ) : natureSites.length === 0 ? (
                            <div className="bg-deepCard border border-stone-800 rounded-xl p-6 relative z-10 shadow-2xl">
                                <div className="flex border-b border-stone-800 pb-4 mb-4 items-center justify-between">
                                    <h3 className="text-xl font-semibold flex items-center gap-2"><MapPin size={22} className="text-neonGreen" /> No Sites Available</h3>
                                    <span className="text-xs bg-stone-800 px-3 py-1 rounded">No Site Records</span>
                                </div>
                                <p className="text-stone-400 text-center py-8">Nature conservation sites coming soon!</p>
                            </div>
                        ) : (
                            natureSites.slice(0, 1).map((site, idx) => {
                                const statusColors = {
                                    'green': { bg: 'bg-neonGreen', text: 'Good to Visit', shadow: 'shadow-[0_0_15px_#22C55E]' },
                                    'yellow': { bg: 'bg-yellow-500', text: 'Getting Busy', shadow: 'shadow-[0_0_15px_#eab308]' },
                                    'red': { bg: 'bg-red-500', text: 'At Capacity', shadow: 'shadow-[0_0_15px_#ef4444]' }
                                };
                                const status = site.status || 'green';
                                const statusConfig = statusColors[status] || statusColors.green;
                                const percentage = site.maxCapacity > 0 ? Math.round((site.currentVisitors / site.maxCapacity) * 100) : 0;
                                const imageUrl = getImageUrl(site.image) || 'https://images.unsplash.com/photo-1549470987-9bb16ab3ac6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                                
                                return (
                                    <div key={site._id || idx} className="bg-deepCard border border-stone-800 rounded-xl p-6 relative z-10 shadow-2xl">
                                        <div className="flex border-b border-stone-800 pb-4 mb-4 items-center justify-between">
                                            <h3 className="text-xl font-semibold flex items-center gap-2"><MapPin size={22} className="text-neonGreen" /> {site.name}</h3>
                                            <span className="text-xs bg-stone-800 px-3 py-1 rounded">Recorded Data</span>
                                        </div>

                                        <img src={imageUrl} alt={site.name} className="w-full h-48 object-cover rounded-md mb-6" />

                                        <div className="flex items-center justify-between p-4 bg-darkBg rounded-lg border border-neonGreen/30">
                                            <div>
                                                <p className="text-stone-400 text-sm mb-1">Current Status</p>
                                                <p className="font-semibold text-lg flex items-center gap-2">
                                                    {statusConfig.text}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {/* Traffic Light */}
                                                <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                                                    <div className={`w-6 h-6 rounded-full ${statusConfig.bg} ${statusConfig.shadow}`}>
                                                        <div className={`w-full h-full rounded-full animate-ping ${statusConfig.bg} opacity-75`}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between text-sm text-stone-400">
                                            <span>Visitors: {site.currentVisitors || 0} / {site.maxCapacity || 400}</span>
                                            <span>{percentage}% Capacity</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* OFFSET INTRO */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-display font-bold text-darkBg mb-6">
                                Small Choices, <br /><span className="text-neonGreen">Infinite Impact.</span>
                            </h2>
                            <div className="space-y-8">
                                <p className="text-stone-500 text-lg leading-relaxed">
                                    The project includes an illustrative catalog of reforestation and renewable-energy projects. It does not verify project claims, process payments, or issue carbon credits.
                                </p>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-neonGreen/10 rounded-xl flex items-center justify-center flex-shrink-0 text-neonGreen">
                                        <Leaf size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 text-darkBg">Offset Ledger Demo</h3>
                                        <p className="text-stone-500 text-sm leading-relaxed mb-4">
                                            Record a sample contribution in the application. No funds are transferred and no impact is independently measured.
                                        </p>
                                        <Link to="/offset" className="text-neonGreen font-bold text-sm hover:underline">Neutralize Your Footprint →</Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
                                alt="Sustainability"
                                className="rounded-3xl shadow-2xl relative z-10"
                            />
                            <div className="absolute -bottom-6 -right-6 w-full h-full bg-neonGreen/10 rounded-3xl -z-10"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CARBON TRACKER SECTION */}
            <section className="py-24 bg-lightBg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-bold text-primaryGreen mb-4">Trip Estimate Summary</h2>
                        <p className="text-stone-600">Estimates are illustrative and depend on route distance and selected listing data.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100">
                        <div className="flex justify-center flex-col items-center">
                            <div className="relative w-[250px] h-[250px]">
                                <PieChart width={250} height={250}>
                                    <Pie
                                        data={pieData}
                                        cx="50%" cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill={tripStats.tripsCount > 0 ? "#22C55E" : "#f3f4f6"} />
                                        <Cell fill="#f3f4f6" />
                                    </Pie>
                                </PieChart>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-display font-bold text-primaryGreen">{tripStats.savedPercent}%</span>
                                    <span className="text-xs text-stone-500 uppercase font-semibold">CO2 Reduced</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-semibold text-primaryGreen mb-6">Your Average Trip Emissions</h3>

                            {tripStats.tripsCount === 0 ? (
                                <div className="p-6 border-2 border-dashed border-stone-200 rounded-xl text-center">
                                    <h4 className="text-lg font-semibold text-stone-600 mb-2">No trips recorded yet</h4>
                                    <p className="text-stone-500 text-sm mb-4">Save a trip to view its indicative estimate here.</p>
                                    <Link to="/planner" className="inline-block px-5 py-2 bg-neonGreen text-darkBg text-sm font-semibold rounded hover:bg-accentGreen transition-colors">
                                        Plan a Trip
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-2 text-stone-600 font-medium">
                                            <span>Car Baseline Estimate</span>
                                            <span>{tripStats.stdEmissions} kg CO2</span>
                                        </div>
                                        <div className="w-full bg-stone-200 rounded-full h-3">
                                            <div className="bg-stone-400 h-3 rounded-full" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2 font-semibold text-primaryGreen">
                                            <span>Planned Trip Estimate</span>
                                            <span>{tripStats.actEmissions} kg CO2</span>
                                        </div>
                                        <div className="w-full bg-stone-200 rounded-full h-3">
                                            <div className="bg-neonGreen h-3 rounded-full shadow-[0_0_10px_#22C55E]" style={{ width: `${100 - tripStats.savedPercent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* GREEN BUSINESSES PREVIEW */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-display font-bold text-primaryGreen mb-4">Business Listings</h2>
                            <p className="text-stone-600">Explore businesses and their platform-admin review status. Badges are not independent certification.</p>
                        </div>
                        <Link to="/businesses" className="hidden sm:inline-block px-6 py-2.5 text-primaryGreen border border-primaryGreen font-semibold rounded hover:bg-lightBg transition-colors">
                            Browse All
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-3 text-center py-12">
                                <div className="w-8 h-8 border-2 border-neonGreen border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-stone-500">Loading eco-partners...</p>
                            </div>
                        ) : reviewedBusinesses.length === 0 ? (
                            <div className="col-span-3 text-center py-12 border-2 border-dashed border-stone-200 rounded-xl">
                                <p className="text-stone-500">No eco-partners found yet. Check back soon!</p>
                            </div>
                        ) : (
                            reviewedBusinesses.slice(0, 6).map((biz, idx) => {
                                const badgeColors = {
                                    'platinum': '#4ADE80',
                                    'gold': '#FFD700',
                                    'silver': '#C0C0C0',
                                    'bronze': '#CD7F32',
                                    'pending': '#9CA3AF'
                                };
                                const color = badgeColors[biz.badgeStatus?.toLowerCase()] || '#4ADE80';
                                const imageUrl = getImageUrl(biz.image) || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
                                
                                return (
                                    <div key={biz._id || idx} className="bg-white border text-stone-800 border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                        <img src={imageUrl} alt={biz.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold">{biz.name}</h3>
                                                <BadgeCheck color={color} size={24} className="drop-shadow-sm" />
                                            </div>
                                            <p className="text-sm font-medium text-stone-500 mb-4">{biz.category}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2.5 py-1 rounded bg-stone-100 font-bold capitalize`} style={{ color: color, border: `1px solid ${color}` }}>
                                                    {biz.badgeStatus || 'Reviewed'} · Platform reviewed
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="mt-8 text-center sm:hidden">
                        <Link to="/businesses" className="inline-block px-6 py-2.5 w-full text-primaryGreen border border-primaryGreen font-semibold rounded hover:bg-lightBg transition-colors">
                            Browse All
                        </Link>
                    </div>
                </div>
            </section>

            {/* EXAMPLE WORKFLOWS */}
            <section className="py-24 bg-lightBg border-t border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-display font-bold text-center text-primaryGreen mb-4">Example Workflows</h2>
                    <p className="text-center text-stone-500 mb-16">Illustrative use cases, not customer testimonials.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {workflows.map((workflow) => (
                            <div key={workflow.title} className="bg-white p-8 rounded-xl border-t-2 border-neonGreen shadow-sm">
                                <h3 className="text-xl font-semibold text-primaryGreen mb-3">{workflow.title}</h3>
                                <p className="text-stone-600 leading-relaxed">{workflow.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-32 bg-darkBg text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2)_0%,transparent_50%)]"></div>
                <div className="relative z-10 max-w-2xl mx-auto px-4">
                    <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6 tracking-tight">Start Your Green Journey Today</h2>
                    <p className="text-stone-300 text-lg mb-10">Create an account to save trips and explore the prototype workflows.</p>
                    <Link to="/register" className="inline-block px-10 py-4 bg-neonGreen text-darkBg text-lg font-bold rounded shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:bg-accentGreen hover:scale-105 transition-all">
                        Create Free Account
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
