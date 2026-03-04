import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Globe, TreePine, Wind, Zap, CheckCircle, Calculator, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/getImageUrl';

const CarbonOffsets = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalOffset: 0, projectsBuilt: 0 });
    const [selectedProject, setSelectedProject] = useState(null);
    const [offsetAmount, setOffsetAmount] = useState(50); // kg

    const formatINR = (amount) => {
        try {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
        } catch {
            return `₹${Math.round(amount)}`;
        }
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/offsets');
                setProjects(Array.isArray(res.data) ? res.data : []);

                // If logged in, fetch personal history for stats
                if (user) {
                    const history = await api.get('/offsets/my-history');
                    const historyRows = Array.isArray(history.data) ? history.data : [];
                    const total = historyRows.reduce((acc, curr) => acc + (curr.amountOffset || 0), 0);
                    setStats({ totalOffset: total, projectsBuilt: historyRows.length });
                }
            } catch (error) {
                console.error('Failed to fetch offset projects', error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [user]);

    const handlePurchase = async () => {
        if (!user) {
            toast.error("Please login to offset your carbon.");
            return;
        }
        if (!selectedProject) {
            toast.error("Please select a project first.");
            return;
        }

        try {
            toast.loading("Processing your contribution...", { id: 'purchase' });
            await api.post('/offsets/purchase', {
                projectId: selectedProject._id,
                amountOffset: offsetAmount
            });
            toast.success(`Successfully offset ${offsetAmount}kg of CO2!`, { id: 'purchase' });
            setStats({ ...stats, totalOffset: stats.totalOffset + parseInt(offsetAmount), projectsBuilt: stats.projectsBuilt + 1 });
            setSelectedProject(null);
        } catch (error) {
            toast.error("failed to complete purchase", { id: 'purchase' });
        }
    };

    return (
        <div className="min-h-screen bg-darkBg pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT: Stats & Explanation */}
                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 bg-neonGreen/10 border border-neonGreen/20 px-4 py-2 rounded-full text-neonGreen text-sm font-bold uppercase tracking-wider mb-6"
                            >
                                <Globe size={16} /> Environmental Neutrality
                            </motion.div>
                            <h1 className="text-4xl font-display font-bold text-white mb-6">
                                Neutralize Your <span className="text-neonGreen">Footprint.</span>
                            </h1>
                            <p className="text-stone-400 text-lg leading-relaxed">
                                Carbon offsetting allows you to compensate for emissions you can't avoid by funding projects that reduce or remove greenhouse gases elsewhere.
                            </p>
                        </div>

                        {user && (
                            <div className="bg-deepCard p-8 rounded-2xl border border-stone-800 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-neonGreen/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                    <Leaf className="text-neonGreen" size={20} /> Your Impact Dashboard
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-darkBg p-4 rounded-xl border border-stone-800">
                                        <p className="text-xs text-stone-500 uppercase font-bold mb-1">Total Offset</p>
                                        <p className="text-2xl font-display font-bold text-neonGreen">{stats.totalOffset} <span className="text-xs">kg</span></p>
                                    </div>
                                    <div className="bg-darkBg p-4 rounded-xl border border-stone-800">
                                        <p className="text-xs text-stone-500 uppercase font-bold mb-1">Projects</p>
                                        <p className="text-2xl font-display font-bold text-white">{stats.projectsBuilt}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-6 bg-neonGreen/5 border border-neonGreen/20 rounded-2xl">
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Calculator size={16} className="text-neonGreen" /> How it works
                            </h4>
                            <ul className="space-y-3 text-sm text-stone-400">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-neonGreen mt-1 flex-shrink-0" />
                                    <span>Calculate your trip emissions in the Planner.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-neonGreen mt-1 flex-shrink-0" />
                                    <span>Select a verified project from the list.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-neonGreen mt-1 flex-shrink-0" />
                                    <span>Contribute to neutralize your impact instantly.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT: Project List */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-display font-bold text-white">Verified Green Projects</h2>
                            <div className="text-xs text-stone-500 uppercase font-bold tracking-widest">Global Portfolio</div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {projects.map((p) => (
                                <div
                                    key={p._id}
                                    className={`relative bg-deepCard rounded-2xl border transition-all overflow-hidden cursor-pointer group ${selectedProject?._id === p._id ? 'border-neonGreen ring-4 ring-neonGreen/10' : 'border-stone-800 hover:border-stone-700'
                                        }`}
                                    onClick={() => setSelectedProject(p)}
                                >
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                                            <img src={getImageUrl(p.image) || p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        </div>
                                        <div className="md:w-2/3 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white group-hover:text-neonGreen transition-colors">{p.name}</h3>
                                                        <p className="text-sm text-neonGreen font-medium">{p.organization}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-display font-bold text-white">{formatINR(p.costPerKg)}</p>
                                                        <p className="text-[10px] text-stone-500 uppercase font-bold">Per kg CO2</p>
                                                    </div>
                                                </div>
                                                <p className="text-stone-400 text-sm mb-4 line-clamp-2">{p.description}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1 text-xs text-stone-500">
                                                        <Globe size={12} /> {p.location}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-stone-500 capitalize">
                                                        {p.type === 'reforestation' ? <TreePine size={12} /> : p.type === 'renewable' ? <Wind size={12} /> : <Zap size={12} />}
                                                        {p.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                {selectedProject?._id === p._id && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                        <CheckCircle className="text-neonGreen" size={24} />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Purchase Section */}
                        {selectedProject && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-darkBg border-2 border-neonGreen p-8 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.1)] relative z-10"
                            >
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Heart className="text-red-500 fill-red-500" size={20} /> Complete Your Offset
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <label className="text-stone-400">Amount to offset (kg)</label>
                                            <span className="text-white font-bold">{offsetAmount} kg</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="5000"
                                            step="10"
                                            value={offsetAmount}
                                            onChange={(e) => setOffsetAmount(e.target.value)}
                                            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-neonGreen"
                                        />
                                        <div className="flex justify-between text-[10px] text-stone-600 font-bold uppercase">
                                            <span>Light Trip (10kg)</span>
                                            <span>International Flight (5t)</span>
                                        </div>
                                    </div>
                                    <div className="bg-deepCard p-6 rounded-xl border border-stone-800 text-center">
                                        <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-1">Total Contribution</p>
                                        <p className="text-4xl font-display font-bold text-white mb-4">
                                            {formatINR(offsetAmount * selectedProject.costPerKg)}
                                        </p>
                                        <button
                                            onClick={handlePurchase}
                                            className="w-full py-4 bg-neonGreen text-darkBg font-bold rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:bg-accentGreen hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Zap size={18} fill="currentColor" /> Offset Now
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarbonOffsets;
