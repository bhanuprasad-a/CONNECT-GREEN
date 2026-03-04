import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MapPin, Users, Activity, Leaf, Info, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/getImageUrl';

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

const SiteCard = ({ site, onShowAlternatives }) => {
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
                <img src={getImageUrl(site.image) || 'https://images.unsplash.com/photo-1549470987-9bb16ab3ac6c?w=600'} alt={site.name} className="w-full h-full object-cover" />
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
                    <button 
                        onClick={() => onShowAlternatives(site)}
                        className="px-5 py-2.5 border border-stone-700 bg-darkBg rounded text-white font-semibold hover:bg-stone-800 transition-colors shadow-sm flex items-center gap-2"
                    >
                        View Alternatives
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const NatureSites = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSite, setSelectedSite] = useState(null);
    const [showAlternatives, setShowAlternatives] = useState(false);

    const MOCK_SITES = [
        // Vijayawada and surrounding natural sites
        { _id: '1', name: 'Kondapalli Fort', location: 'Kondapalli, Vijayawada', maxCapacity: 300, currentVisitors: 180, status: 'yellow', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600' },
        { _id: '2', name: 'Bhavani Island', location: 'Krishna River, Vijayawada', maxCapacity: 200, currentVisitors: 200, status: 'red', image: 'https://images.unsplash.com/photo-1540202404-1b927e77f019?w=600' },
        { _id: '3', name: 'Mangalagiri Hills', location: 'Mangalagiri, Vijayawada', maxCapacity: 150, currentVisitors: 60, status: 'green', image: 'https://images.unsplash.com/photo-1596428232159-71d2de7641db?w=600' },
        { _id: '4', name: 'Undavalli Caves', location: 'Undavalli, Vijayawada', maxCapacity: 100, currentVisitors: 45, status: 'green', image: 'https://images.unsplash.com/photo-1605649673351-35d7b5b2f4d7?w=600' },
        { _id: '5', name: 'Kanaka Durga Temple Hill', location: 'Indrakeeladri, Vijayawada', maxCapacity: 500, currentVisitors: 350, status: 'yellow', image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600' },
        { _id: '6', name: 'Prakasam Barrage', location: 'Krishna River, Vijayawada', maxCapacity: 250, currentVisitors: 80, status: 'green', image: 'https://images.unsplash.com/photo-1549470987-9bb16ab3ac6c?w=600' },
        // Other international sites
        { _id: '7', name: 'Emerald Coast Reserve', location: 'California, USA', maxCapacity: 400, currentVisitors: 120, status: 'green', image: 'https://images.unsplash.com/photo-1549470987-9bb16ab3ac6c?w=600' },
        { _id: '8', name: 'Valley of the Giants', location: 'Western Australia, AU', maxCapacity: 250, currentVisitors: 190, status: 'yellow', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600' }
    ];

    // Alternative sites mapping
    const getAlternativeSites = (currentSite) => {
        const alternatives = MOCK_SITES.filter(site => 
            site._id !== currentSite._id && 
            site.status === 'green' &&
            site.location.toLowerCase().includes('vijayawada')
        );
        return alternatives.slice(0, 3);
    };

    const handleShowAlternatives = (site) => {
        setSelectedSite(site);
        setShowAlternatives(true);
    };

    const handleCloseAlternatives = () => {
        setShowAlternatives(false);
        setSelectedSite(null);
    };

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
                                <SiteCard site={site} onShowAlternatives={handleShowAlternatives} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Alternatives Modal */}
                {showAlternatives && selectedSite && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-deepCard border border-stone-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-stone-800">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            Alternative Sites Near {selectedSite.name}
                                        </h2>
                                        <p className="text-stone-400">
                                            Since {selectedSite.name} is {selectedSite.status === 'red' ? 'at capacity' : 'busy'}, here are some less crowded alternatives in the Vijayawada area:
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCloseAlternatives}
                                        className="text-stone-400 hover:text-white transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                {getAlternativeSites(selectedSite).length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {getAlternativeSites(selectedSite).map(alternative => (
                                            <div key={alternative._id} className="bg-darkBg border border-stone-800 rounded-lg p-4 hover:border-stone-700 transition-colors">
                                                <div className="flex gap-4">
                                                    <img 
                                                        src={getImageUrl(alternative.image) || alternative.image} 
                                                        alt={alternative.name}
                                                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-white mb-1">{alternative.name}</h3>
                                                        <div className="flex items-center gap-1.5 text-stone-400 text-sm mb-2">
                                                            <MapPin size={14} className="text-neonGreen" />
                                                            {alternative.location}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-neonGreen font-semibold text-sm">
                                                                ✓ Perfect Time to Visit
                                                            </span>
                                                            <span className="text-stone-400 text-sm">
                                                                {alternative.currentVisitors}/{alternative.maxCapacity} visitors
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-stone-400">
                                            No alternative green-status sites available in the Vijayawada area at the moment.
                                            Please check back later or consider visiting during off-peak hours.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NatureSites;
