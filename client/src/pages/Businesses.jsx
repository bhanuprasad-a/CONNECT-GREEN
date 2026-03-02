import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { BadgeCheck, Star, MapPin, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Businesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Fallback Mock Data if API isn't populated
    const MOCK_DATA = [
        { _id: '1', name: 'EcoLodge Stay', category: 'hotel', location: 'New York, USA', badgeStatus: 'gold', avgRating: 4.8, image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=500' },
        { _id: '2', name: 'Green Way EVs', category: 'transport', location: 'London, UK', badgeStatus: 'platinum', avgRating: 5.0, image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=500' },
        { _id: '3', name: 'Organic Vegan Bites', category: 'restaurant', location: 'Berlin, DE', badgeStatus: 'silver', avgRating: 4.2, image: 'https://images.unsplash.com/photo-1498837167339-5fe41ae49b99?w=500' },
        { _id: '4', name: 'Coral Rescue Dive', category: 'activity', location: 'Bali, ID', badgeStatus: 'bronze', avgRating: 4.5, image: 'https://images.unsplash.com/photo-1544551763-46a013ad70d3?w=500' }
    ];

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const res = await api.get('/businesses');
                // Use live data if available, else mock
                setBusinesses(res.data.length > 0 ? res.data : MOCK_DATA);
            } catch (error) {
                console.error("Failed to fetch businesses, using mock", error);
                setBusinesses(MOCK_DATA);
                toast.error('Could not connect to live API. Showing mock data.');
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, []);

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

    return (
        <div className="min-h-screen bg-darkBg text-white pt-24 pb-20">
            {/* Header / Hero */}
            <div className="bg-deepCard py-12 border-b border-neonGreen/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
                        Green <span className="text-neonGreen">Directory</span>
                    </h1>
                    <p className="text-stone-400 max-w-2xl mx-auto text-lg">
                        Support local economies and minimize your footprint by choosing from our rigorously verified ecological partners.
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
                            <h4 className="text-xs uppercase text-stone-500 font-semibold mb-3">Badge System</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E5E4E2' }}></div> Platinum (Zero Carbon)</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFD700' }}></div> Gold (-80% Carbon)</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C0C0C0' }}></div> Silver (-50% Carbon)</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#CD7F32' }}></div> Bronze (Basic Green)</div>
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
                                        <img src={biz.image ? (biz.image.startsWith('/') ? 'http://localhost:5000' + biz.image : biz.image) : 'https://via.placeholder.com/500x300?text=No+Image'} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-3 right-3 bg-darkBg/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-stone-700 shadow-xl">
                                            <BadgeCheck fill={getBadgeColor(biz.badgeStatus)} className="text-darkBg" size={18} />
                                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: getBadgeColor(biz.badgeStatus) }}>
                                                {biz.badgeStatus}
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
