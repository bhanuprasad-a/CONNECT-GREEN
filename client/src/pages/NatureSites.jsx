import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MapPin, Users, Activity, Leaf, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const TrafficLightWidget = ({ status }) => {
    // Pulse animation applied only to the active status
    return (
        <div className="flex flex-col gap-2 bg-stone-900 border border-stone-800 rounded-full p-2.5 shadow-[inset_0_4px_6px_rgba(0,0,0,0.6)]">
            <div className={`w-6 h-6 rounded-full transition-all duration-300 ${status === 'red' ? 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse' : 'bg-red-950 opacity-40'}`}></div>
            <div className={`w-6 h-6 rounded-full transition-all duration-300 ${status === 'yellow' ? 'bg-yellow-500 shadow-[0_0_15px_#eab308] animate-pulse' : 'bg-yellow-950 opacity-40'}`}></div>
            <div className={`w-6 h-6 rounded-full transition-all duration-300 ${status === 'green' ? 'bg-neonGreen shadow-[0_0_15px_#22C55E] animate-pulse' : 'bg-green-950 opacity-40'}`}></div>
        </div>
    );
};

const SiteCard = ({ site }) => {
    const percentage = Math.round((site.currentVisitors / site.maxCapacity) * 100);

    // UI text mapping based on status
    const getStatusText = () => {
        if (site.status === 'red') return <span className="text-red-500 font-bold tracking-wider">AT CAPACITY</span>;
        if (site.status === 'yellow') return <span className="text-yellow-500 font-bold tracking-wider">BUSY</span>;
        return <span className="text-neonGreen font-bold tracking-wider">PERFECT TIME TO VISIT</span>;
    };

    return (
        <div className="bg-deepCard border border-stone-800 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all flex flex-col md:flex-row h-full">
            {/* Image Section */}
            <div className="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                <img src={site.image && site.image !== 'no-photo.jpg' ? (site.image.startsWith('/') ? 'http://localhost:5000' + site.image : site.image) : 'https://images.unsplash.com/photo-1549470987-9bb16ab3ac6c?w=600'} alt={site.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-darkBg/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-stone-700">
                    <Leaf className="text-neonGreen" size={14} />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Verified Protected</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:w-3/5 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-bold text-white">{site.name}</h3>
                        <TrafficLightWidget status={site.status} />
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400 text-sm mb-6">
                        <MapPin size={16} className="text-neonGreen px-0.5" />
                        {site.location}
                    </div>

                    <div className="bg-darkBg rounded-lg p-5 border border-stone-800 mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-xs uppercase text-stone-500 font-semibold mb-1">Live Status</p>
                                {getStatusText()}
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase text-stone-500 font-semibold mb-1">Capacity</p>
                                <p className="text-xl font-display font-bold text-white leading-none">
                                    {site.currentVisitors} <span className="text-sm text-stone-500 font-normal">/ {site.maxCapacity}</span>
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-stone-800 rounded-full h-2 mt-4 overflow-hidden relative">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${site.status === 'red' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : site.status === 'yellow' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-neonGreen shadow-[0_0_10px_#22C55E]'}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    {site.status === 'red' ? (
                        <p className="text-red-400 flex items-center gap-2 font-medium">
                            <Info size={16} /> Conservation halted. View alternatives nearby.
                        </p>
                    ) : (
                        <p className="text-stone-400 flex items-center gap-2 text-xs">
                            <Activity size={14} /> Live sensor feed active
                        </p>
                    )}
                    <button className="px-5 py-2.5 border border-stone-700 bg-darkBg rounded text-white font-semibold hover:bg-stone-800 transition-colors shadow-sm">
                        View Alternatives
                    </button>
                </div>
            </div>
        </div>
    );
};

const NatureSites = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    const MOCK_SITES = [
        { _id: '1', name: 'Emerald Coast Reserve', location: 'California, USA', maxCapacity: 400, currentVisitors: 120, status: 'green', image: 'https://images.unsplash.com/photo-1549470987-9bb16ab3ac6c?w=600' },
        { _id: '2', name: 'Valley of the Giants', location: 'Western Australia, AU', maxCapacity: 250, currentVisitors: 190, status: 'yellow', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600' },
        { _id: '3', name: 'Blue Pearl Lagoon', location: 'Palawan, PH', maxCapacity: 150, currentVisitors: 150, status: 'red', image: 'https://images.unsplash.com/photo-1537237858032-484bf84752bb?w=600' }
    ];

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const res = await api.get('/sites');
                setSites(res.data.length > 0 ? res.data : MOCK_SITES);
            } catch (error) {
                console.error("Failed to fetch sites, using mock", error);
                setSites(MOCK_SITES);
                toast.error('Could not connect to live API. Showing mock data.');
            } finally {
                setLoading(false);
            }
        };

        fetchSites();
    }, []);

    return (
        <div className="min-h-screen bg-darkBg text-white pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block border border-red-500/50 bg-red-500/10 text-red-500 font-medium text-xs px-3 py-1 rounded-full mb-4">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
                        LIVE CAPACITY MONITORING
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-display font-bold mb-6">
                        Protect Fragile <span className="text-neonGreen">Ecosystems</span>
                    </h1>
                    <p className="text-stone-400 text-lg">
                        Over-tourism destroys delicate natural habitats. Use our live capacity monitor to check if a park is crowded before you travel, ensuring a better experience for you and nature.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonGreen"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12 lg:px-12">
                        {sites.map(site => (
                            <div key={site._id} className="lg:col-span-2">
                                <SiteCard site={site} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NatureSites;
