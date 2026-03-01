import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Camera, Send, ShieldCheck, CheckCircle, XCircle, TreePine, Map, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="min-h-screen text-white pt-32 text-center">Loading Data...</div>;
    if (!user) return <div className="min-h-screen text-white pt-32 text-center">Not Authorized. Please login.</div>;

    return (
        <div className="min-h-screen bg-darkBg pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Global Dashboard Header */}
                <div className="bg-deepCard p-8 rounded-xl border border-stone-800 shadow-xl mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome, {user.name}</h2>
                        <span className="text-sm font-semibold text-neonGreen uppercase tracking-wider bg-stone-800 px-3 py-1 rounded">
                            {user.role} Account
                        </span>
                    </div>
                    {user.role === 'tourist' && (
                        <div className="text-right">
                            <span className="text-stone-400 text-sm block mb-1">Total Green Points</span>
                            <span className="text-4xl font-display font-bold text-neonGreen">{user.greenPoints || 0}</span>
                        </div>
                    )}
                </div>

                {/* Dynamic Role Views */}
                {user.role === 'tourist' && <TouristView />}
                {user.role === 'business' && <BusinessView />}
                {user.role === 'admin' && <AdminView />}
                {user.role === 'siteManager' && <SiteManagerView />}
            </div>
        </div>
    );
};

/* --- TOURIST VIEW (Carbon Tracking & History) --- */
const TouristView = () => {
    // Mock user history data
    const chartData = [
        { month: 'Aug', offset: 12 },
        { month: 'Sep', offset: 25 },
        { month: 'Oct', offset: 18 },
        { month: 'Nov', offset: 45 },
        { month: 'Dec', offset: 60 },
        { month: 'Jan', offset: 85 }
    ];

    const pastTrips = [
        { id: 1, destination: 'New York Eco-Tour', date: 'Jan 15, 2026', co2Saved: 25, status: 'Completed' },
        { id: 2, destination: 'London Green Weekend', date: 'Dec 02, 2025', co2Saved: 60, status: 'Completed' },
        { id: 3, destination: 'Bali Coral Rescue', date: 'Nov 10, 2025', co2Saved: 45, status: 'Completed' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-deepCard p-6 rounded-xl border border-stone-800 flex items-center gap-4 group hover:border-neonGreen/50 transition-colors">
                    <div className="p-4 bg-darkBg rounded-full border border-stone-800 group-hover:border-neonGreen text-neonGreen transition-colors">
                        <Map size={24} />
                    </div>
                    <div>
                        <h3 className="text-stone-400 font-semibold text-xs uppercase tracking-wider mb-1">Total Trips</h3>
                        <p className="text-3xl font-display font-bold text-white leading-none">3</p>
                    </div>
                </div>

                <div className="bg-deepCard p-6 rounded-xl border border-stone-800 flex items-center gap-4 group hover:border-neonGreen/50 transition-colors">
                    <div className="p-4 bg-darkBg rounded-full border border-stone-800 group-hover:border-neonGreen text-neonGreen transition-colors">
                        <TreePine size={24} />
                    </div>
                    <div>
                        <h3 className="text-stone-400 font-semibold text-xs uppercase tracking-wider mb-1">Carbon Offset</h3>
                        <p className="text-3xl font-display font-bold text-neonGreen leading-none">130 <span className="text-sm text-stone-500 font-normal">kg CO2</span></p>
                    </div>
                </div>

                <div className="bg-deepCard p-6 rounded-xl border border-stone-800 flex items-center gap-4 group hover:border-neonGreen/50 transition-colors">
                    <div className="p-4 bg-darkBg rounded-full border border-stone-800 group-hover:border-neonGreen text-neonGreen transition-colors">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-stone-400 font-semibold text-xs uppercase tracking-wider mb-1">Reviews Left</h3>
                        <p className="text-3xl font-display font-bold text-white leading-none">0</p>
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Carbon Chart */}
                <div className="lg:col-span-2 bg-deepCard p-8 rounded-xl border border-stone-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-display font-bold text-white">Carbon Savings History</h3>
                        <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Past 6 Months</span>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOffset" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#57534E" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#57534E" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0D2818', border: '1px solid #1c1917', borderRadius: '8px' }}
                                    itemStyle={{ color: '#22C55E', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#a8a29e', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="offset" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorOffset)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Trip History Table/List */}
                <div className="lg:col-span-1 bg-deepCard p-8 rounded-xl border border-stone-800">
                    <h3 className="text-xl font-display font-bold text-white mb-6">Recent Green Trips</h3>

                    <div className="space-y-4">
                        {pastTrips.map(trip => (
                            <div key={trip.id} className="p-4 bg-darkBg rounded-lg border border-stone-800 hover:border-neonGreen/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-bold text-white">{trip.destination}</h4>
                                    <span className="text-xs text-neonGreen bg-neonGreen/10 px-2 py-0.5 rounded font-semibold">+{trip.co2Saved}kg</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-stone-500">{trip.date}</span>
                                    <span className="text-stone-400 italic">{trip.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-2.5 border border-stone-700 bg-darkBg rounded text-stone-300 font-semibold hover:text-white hover:border-stone-500 transition-colors text-sm">
                        View All History
                    </button>
                </div>
            </div>
        </div>
    );
};
/* --- BUSINESS VIEW (Image Upload & Badge Application) --- */
const BusinessView = () => {
    const [formData, setFormData] = useState({ name: '', category: 'hotel', location: '', description: '' });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [myBusinesses, setMyBusinesses] = useState([]);

    useEffect(() => {
        const fetchMyBiz = async () => {
            try {
                // Fetch and filter for businesses owned by logged-in user
                const res = await axios.get('http://localhost:5000/api/businesses');
                // The API currently returns all for generic GET. For production, create a dedicated GET /api/businesses/me route
                // For now, if populated works, we find local ones (Assumes owner object has _id populated, or just id string)
                // We'll trust the user context for mocking the fetch here:
            } catch (err) {
                console.error(err);
            }
        };
        fetchMyBiz();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setPreview(URL.createObjectURL(e.target.files[0]));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('location', formData.location);
        data.append('description', formData.description);
        if (file) data.append('image', file); // Multer Cloudinary catches 'image'

        try {
            await axios.post('http://localhost:5000/api/businesses', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Business submitted for Green Verification!");
            setFormData({ name: '', category: 'hotel', location: '', description: '' });
            setFile(null);
            setPreview(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit application");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-deepCard p-8 rounded-xl border border-stone-800">
                <h3 className="text-xl font-display font-bold text-white mb-6 border-b border-stone-800 pb-4">Register Your Eco-Business</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Business Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-darkBg border border-stone-700 rounded py-2 px-3 text-white focus:border-neonGreen outline-none" />

                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-darkBg border border-stone-700 rounded py-2 px-3 text-white focus:border-neonGreen outline-none">
                        <option value="hotel">Eco-Hotel / Lodge</option>
                        <option value="restaurant">Organic Restaurant</option>
                        <option value="transport">Green Transport</option>
                        <option value="activity">Sustainable Activity</option>
                    </select>

                    <input type="text" placeholder="Location (City, Country)" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-darkBg border border-stone-700 rounded py-2 px-3 text-white focus:border-neonGreen outline-none" />

                    <textarea placeholder="Describe your sustainability efforts..." required rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-darkBg border border-stone-700 rounded py-2 px-3 text-white focus:border-neonGreen outline-none custom-scrollbar"></textarea>

                    <div className="border border-stone-700 border-dashed rounded-lg p-6 text-center hover:border-neonGreen transition-colors cursor-pointer bg-darkBg relative">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        {!preview ? (
                            <div className="flex flex-col items-center">
                                <Camera size={24} className="text-stone-400 mb-2" />
                                <span className="text-stone-300 text-sm">Upload Cover Image</span>
                                <span className="text-stone-500 text-xs mt-1">(JPEG, PNG limit 5MB)</span>
                            </div>
                        ) : (
                            <img src={preview} alt="Preview" className="h-32 mx-auto rounded object-cover" />
                        )}
                    </div>

                    <button type="submit" className="w-full py-3 bg-neonGreen text-darkBg font-bold rounded flex justify-center items-center gap-2 hover:bg-accentGreen transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        <Send size={18} /> Apply for Green Badge
                    </button>
                </form>
            </div>

            <div className="bg-deepCard p-8 rounded-xl border border-stone-800 h-fit">
                <h3 className="text-xl font-display font-bold text-white mb-6 border-b border-stone-800 pb-4">My Dashboard</h3>
                <div className="text-center py-10">
                    <ShieldCheck size={48} className="text-stone-600 mx-auto mb-4" />
                    <p className="text-stone-400">Apply utilizing the form. Your business will appear here once submitted and verified.</p>
                </div>
            </div>
        </div>
    );
};

/* --- ADMIN VIEW (Approve pending applications & apply badges) --- */
const AdminView = () => {
    const [pending, setPending] = useState([]);

    // Auto-fetch logic for pending businesses (Mocking standard GET response)
    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/businesses');
                setPending(res.data.filter(b => b.badgeStatus === 'pending' || b.badgeStatus === 'none'));
            } catch (err) {
                console.error("Admin view failed", err);
            }
        };
        fetchPending();
    }, []);

    const handleApproval = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/businesses/${id}/badge`, { badgeStatus: status, isVerified: true });
            toast.success(`Business granted ${status} badge!`);
            setPending(pending.filter(b => b._id !== id)); // Remove from list instantly
        } catch (error) {
            toast.error("Failed to approve business.");
        }
    };

    return (
        <div className="bg-deepCard p-8 rounded-xl border border-stone-800">
            <h3 className="text-xl font-display font-bold text-white mb-6 border-b border-stone-800 pb-4 flex items-center gap-2">
                <ShieldCheck className="text-neonGreen" /> Validation Queue
            </h3>

            {pending.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                    No pending business applications.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-stone-700 text-stone-400 text-sm uppercase">
                                <th className="py-3 px-4">Business Name</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Evidence</th>
                                <th className="py-3 px-4">Verification Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pending.map(biz => (
                                <tr key={biz._id} className="border-b border-stone-800 hover:bg-darkBg transition-colors">
                                    <td className="py-4 px-4">
                                        <span className="text-white font-semibold block">{biz.name}</span>
                                        <span className="text-xs text-stone-500">{biz.location}</span>
                                    </td>
                                    <td className="py-4 px-4 text-stone-300 capitalize">{biz.category}</td>
                                    <td className="py-4 px-4">
                                        {biz.image && biz.image !== 'no-photo.jpg' ? (
                                            <a href={biz.image} target="_blank" rel="noreferrer" className="text-neonGreen hover:underline text-sm">View Image</a>
                                        ) : (
                                            <span className="text-xs text-stone-600">None Provided</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 flex items-center gap-2">
                                        <select className="bg-darkBg text-xs text-white border border-stone-700 rounded px-2 py-1.5 focus:border-neonGreen outline-none"
                                            onChange={(e) => {
                                                if (e.target.value) handleApproval(biz._id, e.target.value);
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Tier...</option>
                                            <option value="bronze">Approve Bronze (-30% CO2)</option>
                                            <option value="silver">Approve Silver (-50% CO2)</option>
                                            <option value="gold">Approve Gold (-80% CO2)</option>
                                            <option value="platinum">Approve Platinum (Zero Carbon)</option>
                                        </select>
                                        <button className="p-1.5 text-red-400 hover:bg-stone-800 rounded transition-colors" title="Reject & Delete">
                                            <XCircle size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

/* --- SITE MANAGER VIEW (Update Live Capacity) --- */
const SiteManagerView = () => {
    const [sites, setSites] = useState([]);

    useEffect(() => {
        const fetchSites = async () => {
            try {
                // Should be GET /api/sites/me, but fetching all for demonstration
                const res = await axios.get('http://localhost:5000/api/sites');
                setSites(res.data);
            } catch (err) {
                console.error("Site Manager view failed", err);
            }
        };
        fetchSites();
    }, []);

    const handleUpdateCapacity = async (id, newCount) => {
        try {
            await axios.put(`http://localhost:5000/api/sites/${id}/visitors`, { currentVisitors: newCount });
            toast.success("Visitor count successfully updated.");

            // Local state update
            setSites(sites.map(site => site._id === id ? { ...site, currentVisitors: parseInt(newCount) } : site));

        } catch (error) {
            toast.error("Failed to update visitor count.");
        }
    };

    return (
        <div className="bg-deepCard p-8 rounded-xl border border-stone-800">
            <h3 className="text-xl font-display font-bold text-white mb-6 border-b border-stone-800 pb-4 flex items-center gap-2">
                <CheckCircle className="text-neonGreen" /> My Managed Sites Dashboard
            </h3>

            {sites.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                    You do not dynamically manage any nature conservation sites yet. Contact platform administration to register a new conservation zone.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sites.map(site => (
                        <div key={site._id} className="bg-darkBg border border-stone-700 rounded-lg p-6">
                            <h4 className="text-lg font-bold text-white mb-1">{site.name}</h4>
                            <p className="text-sm text-stone-500 mb-6">{site.location}</p>

                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs uppercase font-semibold text-stone-400">Current Visitors</span>
                                <span className="text-xs uppercase font-semibold text-stone-400">Max Cap: {site.maxCapacity}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="0"
                                    max={site.maxCapacity}
                                    defaultValue={site.currentVisitors}
                                    className="bg-deepCard border border-stone-600 rounded px-3 py-2 text-white w-full focus:border-neonGreen outline-none font-bold text-xl"
                                    onBlur={(e) => handleUpdateCapacity(site._id, e.target.value)}
                                />
                                <button onClick={(e) => handleUpdateCapacity(site._id, e.target.previousSibling.value)} className="bg-neonGreen text-darkBg px-4 py-2 rounded font-semibold whitespace-nowrap hover:bg-accentGreen transition-colors">
                                    Sync Live
                                </button>
                            </div>
                            <p className="text-xs text-stone-500 mt-3 text-center">
                                Entering a number and clicking Sync live updates the Traffic Light widget across all applications.
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
