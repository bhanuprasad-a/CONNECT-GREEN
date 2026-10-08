import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { BadgeCheck, Star, MapPin, Search, Filter } from 'lucide-react';
import { getImageUrl } from '../utils/getImageUrl';

const Businesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const res = await api.get('/businesses');
                setBusinesses(Array.isArray(res.data) ? res.data : []);
                setFetchError(false);
            } catch {
                setBusinesses([]);
                setFetchError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, [retryCount]);

    const getBadgeColor = (status) => {
        switch (status) {
            case 'platinum': return '#E5E4E2'; // Platinum
            case 'gold': return '#FFD700'; // Gold
            case 'silver': return '#C0C0C0'; // Silver
            case 'bronze': return '#CD7F32'; // Bronze
            default: return '#57534E'; // None/Pending
        }
    };

    const filteredBusinesses = businesses.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === '' || b.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryImage = (category) => {
        switch (category?.toLowerCase()) {
            case 'hotel': return 'https://images.unsplash.com/photo-1566073171639-66290f0cb108?auto=format&w=500&q=80'; // Eco Hotel
            case 'restaurant': return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&w=500&q=80'; // Healthy Food
            case 'transport': return 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&w=500&q=80'; // Clean transit
            case 'activity': return 'https://images.unsplash.com/photo-1544551763-46a013ad70d3?auto=format&w=500&q=80'; // Nature Activity
            default: return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&w=500&q=80'; // Generic Eco
        }
    };

    return (
        <div className="min-h-screen bg-darkBg text-white pt-24 pb-20">
            {/* Header / Hero */}
            <div className="bg-deepCard py-12 border-b border-neonGreen/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
                        Green <span className="text-neonGreen">Directory</span>
                    </h1>
                    <p className="text-stone-400 max-w-2xl mx-auto text-lg">
                        Explore local sustainability listings. Badge status reflects this platform's review workflow, not independent certification.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Filtration Sidebar */}
                <div className="lg:col-span-1 border-r border-stone-800 pr-0 lg:pr-8">
                    <div className="sticky top-28 bg-deepCard p-6 rounded-xl border border-stone-800 shadow-xl">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-stone-800 pb-4">
                            <Filter size={18} className="text-neonGreen" /> Find & Filter
                        </h3>

                        {/* Search Box */}
                        <div className="mb-6 relative">
                            <label className="text-xs uppercase text-stone-500 font-semibold mb-2 block">Search</label>
                            <input
                                type="text"
                                placeholder="Business or Location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-darkBg border border-stone-700 rounded py-2.5 pl-9 pr-3 text-sm focus:border-neonGreen focus:ring-1 focus:ring-neonGreen outline-none transition-all"
                            />
                            <Search className="absolute left-3 top-9 text-stone-500" size={16} />
                        </div>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <label className="text-xs uppercase text-stone-500 font-semibold mb-3 block">Category</label>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setFilterCategory('')} className={`text-left px-3 py-2 text-sm rounded transition-all ${filterCategory === '' ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50' : 'hover:bg-stone-800 text-stone-300'}`}>All Categories</button>
                                <button onClick={() => setFilterCategory('hotel')} className={`text-left px-3 py-2 text-sm rounded transition-all ${filterCategory === 'hotel' ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50' : 'hover:bg-stone-800 text-stone-300'}`}>Eco-Hotels</button>
                                <button onClick={() => setFilterCategory('restaurant')} className={`text-left px-3 py-2 text-sm rounded transition-all ${filterCategory === 'restaurant' ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50' : 'hover:bg-stone-800 text-stone-300'}`}>Restaurants & Food</button>
                                <button onClick={() => setFilterCategory('transport')} className={`text-left px-3 py-2 text-sm rounded transition-all ${filterCategory === 'transport' ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50' : 'hover:bg-stone-800 text-stone-300'}`}>Green Transport</button>
                                <button onClick={() => setFilterCategory('activity')} className={`text-left px-3 py-2 text-sm rounded transition-all ${filterCategory === 'activity' ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50' : 'hover:bg-stone-800 text-stone-300'}`}>Activities & Tours</button>
                            </div>
                        </div>

                        {/* Badge Info Box */}
                        <div className="mt-8 bg-darkBg p-4 rounded border border-stone-800">
                            <h4 className="text-xs uppercase text-stone-500 font-semibold mb-3">Platform Review Tiers</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E5E4E2' }}></div> Platinum review tier</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFD700' }}></div> Gold review tier</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C0C0C0' }}></div> Silver review tier</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#CD7F32' }}></div> Bronze review tier</div>
                                <p className="pt-2 text-stone-500">These tiers are not independent certifications.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonGreen"></div>
                        </div>
                    ) : fetchError ? (
                        <div className="bg-deepCard border border-stone-800 rounded-xl p-12 text-center shadow-lg">
                            <h3 className="text-xl font-medium text-stone-300">Directory unavailable</h3>
                            <p className="text-stone-500 mt-2">The business service could not be reached. No sample listings are being shown.</p>
                            <button onClick={() => { setLoading(true); setRetryCount(retryCount + 1); }} className="mt-6 text-neonGreen hover:text-accentGreen underline underline-offset-4">Try again</button>
                        </div>
                    ) : filteredBusinesses.length === 0 ? (
                        <div className="bg-deepCard border border-stone-800 rounded-xl p-12 text-center shadow-lg">
                            <Search className="mx-auto h-12 w-12 text-stone-600 mb-4" />
                            <h3 className="text-xl font-medium text-stone-300">No Green Businesses Found</h3>
                            <p className="text-stone-500 mt-2">Try adjusting your filters or search term.</p>
                            <button onClick={() => { setSearchTerm(''); setFilterCategory(''); }} className="mt-6 text-neonGreen hover:text-accentGreen underline underline-offset-4">Clear all filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {filteredBusinesses.map(biz => (
                                <div key={biz._id} className="bg-deepCard border border-stone-800 rounded-xl overflow-hidden hover:border-neonGreen/50 transition-all hover:shadow-[0_0_25px_rgba(34,197,94,0.1)] group flex flex-col h-full">
                                    <div className="h-48 relative overflow-hidden">
                                        <img src={getImageUrl(biz.image) || getCategoryImage(biz.category)} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-3 right-3 bg-darkBg/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-stone-700 shadow-xl">
                                            <BadgeCheck fill={getBadgeColor(biz.badgeStatus)} className="text-darkBg" size={18} />
                                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: getBadgeColor(biz.badgeStatus) }}>
                                                {biz.badgeStatus === 'pending' ? 'Under review' : `Platform ${biz.badgeStatus}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">{biz.name}</h3>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-neonGreen mb-3">
                                                    {biz.category}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-stone-800 px-2 py-1 rounded text-sm text-yellow-400 font-bold">
                                                <Star fill="currentColor" size={14} />
                                                {biz.avgRating ? biz.avgRating.toFixed(1) : 'New'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-stone-400 text-sm mt-auto">
                                            <MapPin size={16} />
                                            {biz.location}
                                        </div>
                                        <Link to={`/businesses/${biz._id}`} className="mt-6 w-full py-2.5 border border-stone-700 rounded text-sm font-semibold text-white hover:bg-neonGreen hover:text-darkBg hover:border-neonGreen transition-all flex justify-center items-center">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Businesses;
