import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, BadgeCheck, Activity, Users, Globe, Leaf, Search, MapPin, CheckCircle, Star } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
const features = [
    { icon: <Map size={32} />, title: 'Trip Planner', desc: 'AI-powered routing tailored for low carbon impact and maximum local engagement.' },
    { icon: <BadgeCheck size={32} />, title: 'Green Badge', desc: 'Strict verification system ensuring you only support genuinely sustainable businesses.' },
    { icon: <Activity size={32} />, title: 'Carbon Tracker', desc: 'Real-time metrics on your travel impact and CO2 savings compared to standard trips.' },
    { icon: <Globe size={32} />, title: 'Site Monitor', desc: 'Live traffic light system preventing over-tourism at delicate natural conservation areas.' },
    { icon: <Leaf size={32} />, title: 'Carbon Offset', desc: 'Instantly fund verified planting and clean energy projects to neutralize your footprint.' }
];

const mockBusinesses = [
    { name: 'EcoLodge Paradise', category: 'Hotel', badge: 'Platinum', color: '#4ADE80', img: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { name: 'Greenway Transport', category: 'Transport', badge: 'Gold', color: '#FFD700', img: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { name: 'Organic Bites', category: 'Restaurant', badge: 'Silver', color: '#C0C0C0', img: 'https://images.unsplash.com/photo-1498837167339-5fe41ae49b99?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' }
];

const testimonials = [
    { text: "This platform completely changed how I travel. Seeing my carbon savings in real-time is incredibly rewarding.", name: "Sarah J.", rate: 5 },
    { text: "As an eco-lodge owner, CONNECT GREEN brought us visitors who truly care about our conservation efforts.", name: "David M.", rate: 5 },
    { text: "The site capacity monitor is genius. We avoided a crowded beach and found a hidden gem nearby instead.", name: "Elena R.", rate: 5 }
];

const Home = () => {
    const { user } = useContext(AuthContext);
    const [tripStats, setTripStats] = useState({ tripsCount: 0, savedPercent: 0, stdEmissions: 0, actEmissions: 0 });

    useEffect(() => {
        const fetchTrips = async () => {
            if (user && user.role === 'tourist') {
                try {
                    const token = localStorage.getItem('token');
                    const res = await api.get('/trips', { headers: { Authorization: `Bearer ${token}` } });
                    const trips = res.data.trips || res.data;
                    if (trips.length > 0) {
                        let totalSavings = 0;
                        let totalDistance = 0;
                        trips.forEach(t => {
                            totalSavings += (t.co2Saved || t.carbonSavings || 0);
                            totalDistance += (t.distance || 0);
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
                            The ultimate platform connecting eco-conscious travelers with verified sustainable businesses and protected natural sites.
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
                                <h3 className="text-3xl font-display font-bold text-white">500+</h3>
                                <p className="text-stone-400 text-sm">CO2 Tonnes Saved</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-display font-bold text-white">200+</h3>
                                <p className="text-stone-400 text-sm">Green Businesses</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-display font-bold text-white">50+</h3>
                                <p className="text-stone-400 text-sm">Sites Protected</p>
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
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-display font-bold text-center text-primaryGreen mb-20">How CONNECT GREEN Works</h2>

                    <div className="flex flex-col md:flex-row justify-between items-start relative">
                        {/* Connecting dashed line for desktop */}
                        <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-neonGreen/40 z-0"></div>

                        <div className="flex flex-col items-center text-center max-w-xs mx-auto mb-12 md:mb-0 relative z-10 bg-white px-4">
                            <div className="w-20 h-20 bg-lightBg border-2 border-neonGreen rounded-full flex items-center justify-center text-3xl font-display font-bold text-primaryGreen mb-6 shadow-sm">1</div>
                            <Search className="text-neonGreen mb-3" size={28} />
                            <h3 className="text-xl font-semibold text-primaryGreen mb-2">Search Destination</h3>
                            <p className="text-stone-500 text-sm">Enter your desired location and travel dates into our smart planner.</p>
                        </div>

                        <div className="flex flex-col items-center text-center max-w-xs mx-auto mb-12 md:mb-0 relative z-10 bg-white px-4">
                            <div className="w-20 h-20 bg-lightBg border-2 border-neonGreen rounded-full flex items-center justify-center text-3xl font-display font-bold text-primaryGreen mb-6 shadow-sm">2</div>
                            <CheckCircle className="text-neonGreen mb-3" size={28} />
                            <h3 className="text-xl font-semibold text-primaryGreen mb-2">Choose Green Options</h3>
                            <p className="text-stone-500 text-sm">Select strictly verified eco-accommodations, transport, and local food.</p>
                        </div>

                        <div className="flex flex-col items-center text-center max-w-xs mx-auto relative z-10 bg-white px-4">
                            <div className="w-20 h-20 bg-lightBg border-2 border-neonGreen rounded-full flex items-center justify-center text-3xl font-display font-bold text-primaryGreen mb-6 shadow-sm">3</div>
                            <Activity className="text-neonGreen mb-3" size={28} />
                            <h3 className="text-xl font-semibold text-primaryGreen mb-2">Track Your Impact</h3>
                            <p className="text-stone-500 text-sm">Watch your carbon footprint shrink and earn reward points for your trip.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SITE CAPACITY MONITOR SHOWCASE */}
            <section className="py-24 bg-darkBg text-white border-t border-b border-neonGreen/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-neonGreen font-semibold tracking-wider text-sm mb-2 block uppercase">Live IoT Integration</span>
                        <h2 className="text-4xl font-display font-bold mb-6">Protect Ecosystems from Over-tourism</h2>
                        <p className="text-stone-300 text-lg leading-relaxed mb-8">
                            Natural sites suffer when overwhelmed. We partner with conservation zones using live sensor data to display real-time capacity. Our smart routing directs tourists to alternative quiet spots when areas become too busy.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-neonGreen" /> Real-time capacity awareness</li>
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-neonGreen" /> Alternative destination suggestions</li>
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-neonGreen" /> Direct revenue to conservation</li>
                        </ul>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-neonGreen/10 rounded-2xl blur-xl"></div>
                        <div className="bg-deepCard border border-stone-800 rounded-xl p-6 relative z-10 shadow-2xl">
                            <div className="flex border-b border-stone-800 pb-4 mb-4 items-center justify-between">
                                <h3 className="text-xl font-semibold flex items-center gap-2"><MapPin size={22} className="text-neonGreen" /> Emerald Coast Reserve</h3>
                                <span className="text-xs bg-stone-800 px-3 py-1 rounded">Live Data Central</span>
                            </div>

                            <img src="https://images.unsplash.com/photo-1549470987-9bb16ab3ac6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Reserve" className="w-full h-48 object-cover rounded-md mb-6" />

                            <div className="flex items-center justify-between p-4 bg-darkBg rounded-lg border border-neonGreen/30">
                                <div>
                                    <p className="text-stone-400 text-sm mb-1">Current Status</p>
                                    <p className="font-semibold text-lg flex items-center gap-2">
                                        Good to Visit
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Traffic Light */}
                                    <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                                        <div className="w-6 h-6 rounded-full bg-neonGreen shadow-[0_0_15px_#22C55E]">
                                            <div className="w-full h-full rounded-full animate-ping bg-neonGreen opacity-75"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between text-sm text-stone-400">
                                <span>Visitors: 120 / 400</span>
                                <span>Updated: Just now</span>
                            </div>
                        </div>
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
                                    Travel always leaves a trace, but it doesn't have to be a burden. Through our verified carbon offset programs, you can neutralize your footprint by funding reforestation and renewable energy projects worldwide.
                                </p>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-neonGreen/10 rounded-xl flex items-center justify-center flex-shrink-0 text-neonGreen">
                                        <Leaf size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 text-darkBg">Verified Carbon Offsetting</h3>
                                        <p className="text-stone-500 text-sm leading-relaxed mb-4">
                                            Fund global projects from reforestation to renewable energy through our verified portfolio. Real impact, tracked in real-time.
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
                        <h2 className="text-4xl font-display font-bold text-primaryGreen mb-4">Total Platform Impact</h2>
                        <p className="text-stone-600">Every green choice scales into massive global impact.</p>
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
                                    <p className="text-stone-500 text-sm mb-4">Participate in the trips by planning green routes to see your real-time carbon reduction average!</p>
                                    <Link to="/planner" className="inline-block px-5 py-2 bg-neonGreen text-darkBg text-sm font-semibold rounded hover:bg-accentGreen transition-colors">
                                        Plan a Trip
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-2 text-stone-600 font-medium">
                                            <span>Standard Tourist Trip</span>
                                            <span>{tripStats.stdEmissions} kg CO2</span>
                                        </div>
                                        <div className="w-full bg-stone-200 rounded-full h-3">
                                            <div className="bg-stone-400 h-3 rounded-full" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2 font-semibold text-primaryGreen">
                                            <span>CONNECT GREEN Trip</span>
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
                            <h2 className="text-4xl font-display font-bold text-primaryGreen mb-4">Certified Eco-Partners</h2>
                            <p className="text-stone-600">Discover hotels and services rigorously verified for sustainability.</p>
                        </div>
                        <Link to="/businesses" className="hidden sm:inline-block px-6 py-2.5 text-primaryGreen border border-primaryGreen font-semibold rounded hover:bg-lightBg transition-colors">
                            Browse All
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {mockBusinesses.map((biz, idx) => (
                            <div key={idx} className="bg-white border text-stone-800 border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                <img src={biz.img} alt={biz.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-semibold">{biz.name}</h3>
                                        <BadgeCheck color={biz.color} size={24} className="drop-shadow-sm" />
                                    </div>
                                    <p className="text-sm font-medium text-stone-500 mb-4">{biz.category}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2.5 py-1 rounded bg-stone-100 font-bold`} style={{ color: biz.color, border: `1px solid ${biz.color}` }}>
                                            {biz.badge} Certified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center sm:hidden">
                        <Link to="/businesses" className="inline-block px-6 py-2.5 w-full text-primaryGreen border border-primaryGreen font-semibold rounded hover:bg-lightBg transition-colors">
                            Browse All
                        </Link>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-24 bg-lightBg border-t border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-display font-bold text-center text-primaryGreen mb-16">Stories from the Green Community</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-white p-8 rounded-xl border-t-2 border-neonGreen shadow-sm">
                                <div className="flex gap-1 text-neonGreen mb-4">
                                    {[...Array(t.rate)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-stone-600 mb-6 italic leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-deepCard text-white rounded-full flex items-center justify-center font-bold font-display">{t.name.charAt(0)}</div>
                                    <span className="font-semibold text-primaryGreen">{t.name}</span>
                                </div>
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
                    <p className="text-stone-300 text-lg mb-10">Join thousands of travelers making a real difference to global ecosystems without compromising on adventure.</p>
                    <Link to="/register" className="inline-block px-10 py-4 bg-neonGreen text-darkBg text-lg font-bold rounded shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:bg-accentGreen hover:scale-105 transition-all">
                        Create Free Account
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
