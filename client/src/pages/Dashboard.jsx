import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
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
                {user.role === 'business' && <BusinessView user={user} />}
                {user.role === 'admin' && <AdminView />}
                {user.role === 'siteManager' && <SiteManagerView />}
            </div>
        </div>
    );
};

/* --- TOURIST VIEW (Carbon Tracking & History) --- */
const TouristView = () => {
    const [chartData, setChartData] = useState([
        { month: 'Aug', offset: 12 },
        { month: 'Sep', offset: 25 },
        { month: 'Oct', offset: 18 },
        { month: 'Nov', offset: 45 },
        { month: 'Dec', offset: 60 },
        { month: 'Jan', offset: 85 }
    ]);
    const [pastTrips, setPastTrips] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await api.get('/trips', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.data) {
                    setPastTrips(res.data.trips || res.data);
                    if (res.data.chartData) {
                        setChartData(res.data.chartData);
                    }
                }
            } catch (error) {
                console.error("Error fetching trip history:", error);
                toast.error("Could not load your trip history.");
            }
        };

        fetchDashboardData();
    }, []);

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

                    <div className="mt-8 pt-6 border-t border-stone-800">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h4 className="text-white font-bold font-display text-lg mb-1">Passionate about Nature Conservation?</h4>
                                <p className="text-stone-400 text-sm max-w-md">Become a Conservation Site Manager. Apply now to get access to custom dashboard tools to control visitor statuses!</p>
                            </div>
                            <a href="/apply-site-manager" className="bg-stone-800 hover:bg-stone-700 text-white font-semibold py-2 px-6 rounded border border-stone-700 transition-colors whitespace-nowrap text-sm h-fit">
                                Apply as Site Manager
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right: Trip History Table/List */}
                <div className="lg:col-span-1 bg-deepCard p-8 rounded-xl border border-stone-800">
                    <h3 className="text-xl font-display font-bold text-white mb-6">Recent Green Trips</h3>

                    <div className="space-y-4">
                        {pastTrips.map(trip => (
                            <div key={trip._id || trip.id} className="p-4 bg-darkBg rounded-lg border border-stone-800 hover:border-neonGreen/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-bold text-white">{trip.destination || 'Eco-Tour'}</h4>
                                    <span className="text-xs text-neonGreen bg-neonGreen/10 px-2 py-0.5 rounded font-semibold">+{trip.co2Saved || 0}kg</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-stone-500">{new Date(trip.date || Date.now()).toLocaleDateString() || trip.date}</span>
                                    <span className="text-stone-400 italic">{trip.status || 'Completed'}</span>
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
const BusinessView = ({ user }) => {
    const [formData, setFormData] = useState({ name: '', category: 'hotel', location: '', description: '' });
    const [greenCriteria, setGreenCriteria] = useState({
        renewableEnergyPercent: 0,
        hasNoPlastics: false,
        sourcesLocally: false,
        waterConservation: false,
        fairWageEmployment: false,
        habitatProtection: false
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [myBusinesses, setMyBusinesses] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const fetchMyBiz = async () => {
        try {
            const res = await api.get('/businesses');
            const ownerId = user?._id || user?.id;
            setMyBusinesses(res.data.filter(b => {
                const bOwnerId = b.owner?._id || b.owner;
                return bOwnerId === ownerId;
            }));
        } catch (err) {
            console.error("Failed fetching businesses", err);
        }
    };

    useEffect(() => {
        if (user) fetchMyBiz();
    }, [user]);

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
        data.append('greenCriteria', JSON.stringify(greenCriteria));
        if (file) data.append('image', file); // Multer Cloudinary catches 'image'

        if (editingId) {
            data.append('badgeStatus', 'pending');
            data.append('isVerified', false);
            data.append('rejectionReason', ''); // clear reason on reapply
        }

        try {
            if (editingId) {
                await api.put(`/businesses/${editingId}`, data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success("Application updated and re-submitted for verification!");
            } else {
                await api.post('/businesses', data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success("Business submitted for Green Verification!");
            }

            setFormData({ name: '', category: 'hotel', location: '', description: '' });
            setGreenCriteria({ renewableEnergyPercent: 0, hasNoPlastics: false, sourcesLocally: false, waterConservation: false, fairWageEmployment: false, habitatProtection: false });
            setFile(null);
            setPreview(null);
            setEditingId(null);
            fetchMyBiz(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit application");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-deepCard p-8 rounded-xl border border-stone-800">
                <h3 className="text-xl font-display font-bold text-white mb-6 border-b border-stone-800 pb-4">
                    {editingId ? "Edit & Re-apply Business" : "Register Your Eco-Business"}
                </h3>
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

                    <div className="bg-darkBg p-4 border border-stone-800 rounded-lg space-y-4">
                        <h4 className="text-neonGreen font-semibold text-sm uppercase tracking-wider mb-2">Green Criteria Questionnaire</h4>

                        <div>
                            <label className="text-stone-300 text-sm block mb-1">What percentage of your energy comes from renewable sources?</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min="0" max="100" value={greenCriteria.renewableEnergyPercent} onChange={(e) => setGreenCriteria({ ...greenCriteria, renewableEnergyPercent: parseInt(e.target.value) })} className="w-full accent-neonGreen" />
                                <span className="text-white font-bold min-w-[3rem] text-right">{greenCriteria.renewableEnergyPercent}%</span>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={greenCriteria.hasNoPlastics} onChange={(e) => setGreenCriteria({ ...greenCriteria, hasNoPlastics: e.target.checked })} className="w-5 h-5 accent-neonGreen cursor-pointer flex-shrink-0" />
                            <span className="text-stone-300 text-sm">We have effectively banned single-use plastics from our operations.</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={greenCriteria.sourcesLocally} onChange={(e) => setGreenCriteria({ ...greenCriteria, sourcesLocally: e.target.checked })} className="w-5 h-5 accent-neonGreen cursor-pointer flex-shrink-0" />
                            <span className="text-stone-300 text-sm">We source more than 60% of our supplies locally (within 50 miles).</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={greenCriteria.waterConservation} onChange={(e) => setGreenCriteria({ ...greenCriteria, waterConservation: e.target.checked })} className="w-5 h-5 accent-neonGreen cursor-pointer flex-shrink-0" />
                            <span className="text-stone-300 text-sm">We utilize advanced water conservation (low-flow systems, rainwater harvesting).</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={greenCriteria.fairWageEmployment} onChange={(e) => setGreenCriteria({ ...greenCriteria, fairWageEmployment: e.target.checked })} className="w-5 h-5 accent-neonGreen cursor-pointer flex-shrink-0" />
                            <span className="text-stone-300 text-sm">We guarantee fair wages and prioritize hiring from the local community.</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={greenCriteria.habitatProtection} onChange={(e) => setGreenCriteria({ ...greenCriteria, habitatProtection: e.target.checked })} className="w-5 h-5 accent-neonGreen cursor-pointer flex-shrink-0" />
                            <span className="text-stone-300 text-sm">We actively participate in ecosystem/habitat protection and guest education.</span>
                        </label>
                    </div>

                    <div className="border border-stone-700 border-dashed rounded-lg p-6 text-center hover:border-neonGreen transition-colors cursor-pointer bg-darkBg relative">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                        {!preview ? (
                            <div className="flex flex-col items-center">
                                <Camera size={24} className="text-stone-400 mb-2" />
                                <span className="text-stone-300 text-sm">Upload Evidence Form (Image/Doc)</span>
                                <span className="text-stone-500 text-xs mt-1 text-center px-4">Provide proof of solar panels, local farm invoices, or no-plastic amenities.</span>
                            </div>
                        ) : (
                            <img src={preview} alt="Preview" className="h-32 mx-auto rounded object-cover" />
                        )}
                    </div>

                    <button type="submit" className="w-full py-3 bg-neonGreen text-darkBg font-bold rounded flex justify-center items-center gap-2 hover:bg-accentGreen transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        <Send size={18} /> {editingId ? "Submit Re-application" : "Apply for Green Badge"}
                    </button>
                </form>
            </div>

            <div className="bg-deepCard p-8 rounded-xl border border-stone-800 h-fit">
                <h3 className="text-xl font-display font-bold text-white mb-6 border-b border-stone-800 pb-4">My Businesses & Status</h3>

                {myBusinesses.length === 0 ? (
                    <div className="text-center py-10">
                        <ShieldCheck size={48} className="text-stone-600 mx-auto mb-4" />
                        <p className="text-stone-400">Apply utilizing the form. Your business will appear here once submitted.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myBusinesses.map(biz => (
                            <div key={biz._id} className="p-4 bg-darkBg border border-stone-700 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-white font-bold text-lg">{biz.name}</h4>
                                    <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${biz.badgeStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                        biz.badgeStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                            biz.badgeStatus !== 'none' ? 'bg-neonGreen/20 text-neonGreen' : 'bg-stone-800 text-stone-400'
                                        }`}>
                                        {biz.badgeStatus}
                                    </span>
                                </div>
                                <p className="text-sm text-stone-400 capitalize mb-2">{biz.category} • {biz.location}</p>

                                {biz.badgeStatus === 'rejected' && (
                                    <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
                                        <div className="flex items-start gap-2 mb-2">
                                            <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="text-red-400 font-bold block text-sm">Application Needs Correction</span>
                                                <p className="text-stone-300 text-xs mt-1 leading-relaxed">Admin Feedback: "{biz.rejectionReason || 'Please review your green criteria and evidence.'}"</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingId(biz._id);
                                                setFormData({ name: biz.name, category: biz.category, location: biz.location, description: biz.description });
                                                if (biz.greenCriteria) setGreenCriteria({
                                                    renewableEnergyPercent: biz.greenCriteria.renewableEnergyPercent || 0,
                                                    hasNoPlastics: !!biz.greenCriteria.hasNoPlastics,
                                                    sourcesLocally: !!biz.greenCriteria.sourcesLocally,
                                                    waterConservation: !!biz.greenCriteria.waterConservation,
                                                    fairWageEmployment: !!biz.greenCriteria.fairWageEmployment,
                                                    habitatProtection: !!biz.greenCriteria.habitatProtection
                                                });
                                                setPreview(biz.image && biz.image !== 'no-photo.jpg' ? (biz.image.startsWith('/') ? 'http://localhost:5000' + biz.image : biz.image) : null);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="w-full mt-2 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded transition-colors"
                                        >
                                            Edit Application & Re-Submit
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/* --- ADMIN VIEW (Approve pending applications & apply badges) --- */
const AdminView = () => {
    const [pending, setPending] = useState([]);
    const [newSite, setNewSite] = useState({ mgrName: '', mgrEmail: '', mgrPassword: '', siteName: '', siteLocation: '', maxCapacity: '' });

    // Auto-fetch logic for pending businesses (Mocking standard GET response)
    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await api.get('/businesses');
                setPending(res.data.filter(b => b.badgeStatus === 'pending' || b.badgeStatus === 'none'));
            } catch (err) {
                console.error("Admin view failed", err);
            }
        };
        fetchPending();
    }, []);

    const [pendingManagers, setPendingManagers] = useState([]);

    useEffect(() => {
        const fetchPendingManagers = async () => {
            try {
                const res = await api.get('/site-requests');
                setPendingManagers(res.data.filter(r => r.status === 'pending'));
            } catch (error) {
                console.error("Admin View failed fetching requests:", error);
            }
        }
        fetchPendingManagers();
    }, []);


    const handleApproval = async (id, status) => {
        try {
            await api.put(`/businesses/${id}/badge`, { badgeStatus: status, isVerified: true });
            toast.success(`Business granted ${status} badge!`);
            setPending(pending.filter(b => b._id !== id)); // Remove from list instantly
        } catch (error) {
            toast.error("Failed to approve business.");
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Reason for rejection (this will be sent to the business to correct):");
        if (reason === null) return; // User cancelled
        if (!reason.trim()) {
            return toast.error("A reason is required to reject an application.");
        }
        try {
            await api.put(`/businesses/${id}/badge`, { badgeStatus: 'rejected', isVerified: false, rejectionReason: reason });
            toast.success(`Application rejected.`);
            setPending(pending.filter(b => b._id !== id));
        } catch (error) {
            console.error("Rejection Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to reject application.");
        }
    };

    const handleManagerApproval = async (id, status) => {
        let reason = '';
        if (status === 'rejected') {
            reason = window.prompt("Reason for rejection (optional):");
            if (reason === null) return;
        }

        try {
            await api.put(`/site-requests/${id}/status`, { status, rejectionReason: reason }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success(`Site manager request ${status}!`);
            setPendingManagers(pendingManagers.filter(r => r._id !== id));
        } catch (error) {
            toast.error("Failed to update site manager request.");
        }
    };


    const handleCreateSiteManager = async (e) => {
        e.preventDefault();
        try {
            // 1. Create the Site Manager account
            const registerRes = await api.post('/auth/register', {
                name: newSite.mgrName,
                email: newSite.mgrEmail,
                password: newSite.mgrPassword,
                role: 'siteManager'
            });

            const managerId = registerRes.data._id;

            // 2. Create the Nature Site assigned to them
            await api.post('/sites', {
                name: newSite.siteName,
                location: newSite.siteLocation,
                maxCapacity: parseInt(newSite.maxCapacity),
                manager: managerId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            toast.success("Site and Manager successfully registered!");
            setNewSite({ mgrName: '', mgrEmail: '', mgrPassword: '', siteName: '', siteLocation: '', maxCapacity: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create manager or site.");
        }
    };

    return (
        <div className="space-y-8">
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
                                            <div className="flex flex-col gap-1 mb-2">
                                                {biz.greenCriteria && (
                                                    <div className="bg-darkBg p-2 rounded text-xs border border-stone-800">
                                                        <p><span className="text-stone-500">Renewable:</span> <span className="text-neonGreen font-bold">{biz.greenCriteria.renewableEnergyPercent || 0}%</span></p>
                                                        <p><span className="text-stone-500">No Plastics:</span> {biz.greenCriteria.hasNoPlastics ? '✅' : '❌'}</p>
                                                        <p><span className="text-stone-500">Water Consv:</span> {biz.greenCriteria.waterConservation ? '✅' : '❌'}</p>
                                                        <p><span className="text-stone-500">Local Sourcing:</span> {biz.greenCriteria.sourcesLocally ? '✅' : '❌'}</p>
                                                        <p><span className="text-stone-500">Fair Wage:</span> {biz.greenCriteria.fairWageEmployment ? '✅' : '❌'}</p>
                                                        <p><span className="text-stone-500">Habitat Prot:</span> {biz.greenCriteria.habitatProtection ? '✅' : '❌'}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {biz.image && biz.image !== 'no-photo.jpg' ? (
                                                <a href={biz.image.startsWith('/') ? 'http://localhost:5000' + biz.image : biz.image} target="_blank" rel="noreferrer" className="text-neonGreen hover:underline text-sm font-semibold inline-flex items-center gap-1">View Evidence <Map size={12} /></a>
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
                                            <button onClick={() => handleReject(biz._id)} className="p-1.5 text-red-400 hover:bg-stone-800 rounded transition-colors" title="Reject & Request Edits">
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
            {/* Create Conservation Site & Manager Form */}
            <div className="bg-deepCard p-8 rounded-xl border border-stone-800">
                <h3 className="text-xl font-display font-bold text-white mb-6 border-b border-stone-800 pb-4 flex items-center gap-2">
                    <Map className="text-neonGreen" /> Register Nature Site & Manager
                </h3>

                <form onSubmit={handleCreateSiteManager} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-sm uppercase text-stone-500 font-semibold mb-2">Manager Account</h4>
                        <input type="text" placeholder="Manager Full Name" required value={newSite.mgrName} onChange={(e) => setNewSite({ ...newSite, mgrName: e.target.value })} className="w-full bg-darkBg border border-stone-700 rounded py-2 px-3 text-white focus:border-neonGreen outline-none" />
                        <input type="email" placeholder="Manager Email" required value={newSite.mgrEmail} onChange={(e) => setNewSite({ ...newSite, mgrEmail: e.target.value })} className="w-full bg-darkBg border border-stone-700 rounded py-2 px-3 text-white focus:border-neonGreen outline-none" />
                        <input type="password" placeholder="Temporary Password" required value={newSite.mgrPassword} onChange={(e) => setNewSite({ ...newSite, mgrPassword: e.target.value })} className="w-full bg-darkBg border border-stone-700 rounded py-2 px-3 text-white focus:border-neonGreen outline-none" />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm uppercase text-stone-500 font-semibold mb-2">Conservation Site</h4>
                        <input type="text" placeholder="Site Name (e.g. Emerald Coast)" required value={newSite.siteName} onChange={(e) => setNewSite({ ...newSite, siteName: e.target.value })} className="w-full bg-darkBg border border-stone-700 rounded py-2 px-3 text-white focus:border-neonGreen outline-none" />
                        <input type="text" placeholder="Location" required value={newSite.siteLocation} onChange={(e) => setNewSite({ ...newSite, siteLocation: e.target.value })} className="w-full bg-darkBg border border-stone-700 rounded py-2 px-3 text-white focus:border-neonGreen outline-none" />
                        <input type="number" placeholder="Daily Max Visitor Capacity" required value={newSite.maxCapacity} onChange={(e) => setNewSite({ ...newSite, maxCapacity: e.target.value })} className="w-full bg-darkBg border border-stone-700 rounded py-2 px-3 text-white focus:border-neonGreen outline-none" />
                    </div>

                    <div className="md:col-span-2 mt-4">
                        <button type="submit" className="w-full py-3 bg-stone-800 text-white font-bold rounded flex justify-center items-center gap-2 hover:bg-neonGreen hover:text-darkBg transition-colors border border-stone-700 hover:border-transparent">
                            <CheckCircle size={18} /> Create Account & Register Site
                        </button>
                        <p className="text-xs text-stone-500 text-center mt-3">The manager will be able to log in to dynamically update the live capacity of the created site.</p>
                    </div>
                </form>
            </div>
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
                const res = await api.get('/sites');
                setSites(res.data);
            } catch (err) {
                console.error("Site Manager view failed", err);
            }
        };
        fetchSites();
    }, []);

    const handleUpdateCapacity = async (id, newCount) => {
        try {
            await api.put(`/sites/${id}/visitors`, { currentVisitors: newCount });
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
