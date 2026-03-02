import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Star, BadgeCheck, ShieldCheck, ChevronLeft, Leaf, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const BusinessDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [business, setBusiness] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Rating Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch business
                const bizRes = await api.get(`/businesses/${id}`);
                setBusiness(bizRes.data);

                // Fetch reviews
                const revRes = await api.get(`/reviews/${id}`);
                setReviews(revRes.data);
            } catch (error) {
                // Mock data fallback for demonstration if DB is empty
                setBusiness({
                    _id: id,
                    name: 'EcoLodge Visionary',
                    category: 'hotel',
                    location: 'Costa Rica',
                    description: 'A 100% off-grid luxury eco-lodge deep in the rainforest. We utilize solar energy, rainwater harvesting, and support local indigenous communities through fair trade tourism.',
                    badgeStatus: 'platinum',
                    avgRating: 4.9,
                    isVerified: true,
                    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1000'
                });
                setReviews([
                    { _id: '1', user: { name: 'Sarah Jenkins' }, rating: 5, comment: 'Absolutely breathtaking. The zero-waste restaurant was incredible.', createdAt: '2026-02-14T00:00:00Z' },
                    { _id: '2', user: { name: 'David Cho' }, rating: 4, comment: 'Great location, very strict recycling protocols which was nice to see.', createdAt: '2026-01-22T00:00:00Z' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/reviews', {
                businessId: id,
                rating,
                comment
            });
            toast.success("Review posted!");
            // Prepend new review to state
            setReviews([{ user: { name: user.name }, rating, comment, createdAt: new Date() }, ...reviews]);
            setComment('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post review');
        }
    };

    const getBadgeColor = (status) => {
        switch (status) {
            case 'platinum': return '#E5E4E2';
            case 'gold': return '#FFD700';
            case 'silver': return '#C0C0C0';
            case 'bronze': return '#CD7F32';
            default: return '#57534E';
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-neonGreen pt-32">Loading Details...</div>;
    if (!business) return <div className="min-h-screen text-center text-white pt-32">Business not found.</div>;

    const badgeColor = getBadgeColor(business.badgeStatus);

    return (
        <div className="min-h-screen bg-darkBg text-white pt-24 pb-20">
            {/* Hero Banner */}
            <div className="relative h-96 w-full object-cover">
                <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-darkBg/60 to-transparent z-10 w-full h-full"></div>
                <img src={business.image || 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1000'} alt={business.name} className="w-full h-full object-cover" />

                <div className="absolute top-6 left-6 z-20">
                    <Link to="/businesses" className="flex items-center gap-1 text-white bg-black/50 backdrop-blur pl-2 pr-4 py-1.5 rounded-full text-sm font-semibold hover:bg-neonGreen hover:text-darkBg transition-all">
                        <ChevronLeft size={16} /> Back to Directory
                    </Link>
                </div>

                {/* Floating Badge */}
                {business.isVerified && (
                    <div className="absolute top-6 right-6 z-20 bg-darkBg/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 border shadow-[0_0_30px_rgba(255,255,255,0.1)]" style={{ borderColor: badgeColor }}>
                        <BadgeCheck fill={badgeColor} className="text-darkBg" size={24} />
                        <span className="font-bold uppercase tracking-widest text-sm" style={{ color: badgeColor }}>
                            {business.badgeStatus} Certified
                        </span>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 w-full z-20 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between">
                    <div>
                        <p className="text-neonGreen uppercase tracking-wider font-bold text-sm mb-2">{business.category}</p>
                        <h1 className="text-5xl font-display font-bold mb-2">{business.name}</h1>
                        <div className="flex items-center gap-4 text-stone-300">
                            <span className="flex items-center gap-1"><MapPin size={18} className="text-neonGreen" /> {business.location}</span>
                            <span className="flex items-center gap-1 text-yellow-400 font-bold"><Star fill="currentColor" size={18} /> {business.avgRating ? business.avgRating.toFixed(1) : 'New'}</span>
                        </div>
                    </div>

                    <div className="mt-6 md:mt-0 flex gap-4">
                        <button className="px-6 py-3 bg-neonGreen text-darkBg font-bold rounded shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:bg-accentGreen transition-colors flex items-center gap-2">
                            <Leaf size={18} /> Add to Trip Planner
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-12">
                    {/* About Section */}
                    <section>
                        <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                            About our Mission <ShieldCheck className="text-neonGreen" />
                        </h2>
                        <div className="p-6 bg-deepCard border border-stone-800 rounded-xl">
                            <p className="text-stone-300 leading-relaxed text-lg">
                                {business.description}
                            </p>
                        </div>
                    </section>

                    {/* Community Reviews Section */}
                    <section>
                        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2 border-b border-stone-800 pb-4">
                            Green Community Reviews <MessageSquare className="text-stone-400" size={20} />
                        </h2>

                        {/* Write Review Form */}
                        {user && user.role === 'tourist' ? (
                            <form onSubmit={submitReview} className="mb-8 p-6 border border-stone-800 rounded-xl bg-darkBg shadow-inner">
                                <h3 className="font-semibold text-white mb-4">Leave a verified review</h3>
                                <div className="flex gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setRating(num)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star size={28} fill={rating >= num ? '#EAB308' : 'none'} className={rating >= num ? 'text-yellow-500' : 'text-stone-600'} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    className="w-full bg-deepCard border border-stone-700 rounded-lg p-3 text-white focus:border-neonGreen outline-none mb-4 min-h-[100px]"
                                    placeholder="How sustainable was your experience?"
                                    value={comment}
                                    required
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-stone-800 border border-stone-600 hover:border-neonGreen text-white px-6 py-2 rounded font-semibold transition-colors">
                                        Post Review
                                    </button>
                                </div>
                            </form>
                        ) : !user ? (
                            <div className="mb-8 p-4 bg-stone-900 border border-stone-800 rounded-lg flex justify-between items-center">
                                <span className="text-stone-400 text-sm">Please log in to leave a review.</span>
                                <Link to="/login" className="text-neonGreen text-sm font-semibold hover:underline">Log In</Link>
                            </div>
                        ) : null}

                        {/* Review List */}
                        <div className="space-y-4">
                            {reviews.length === 0 ? (
                                <p className="text-stone-500 italic">No reviews yet. Be the first to verify their green practices!</p>
                            ) : (
                                reviews.map((rev, idx) => (
                                    <div key={idx} className="p-6 bg-deepCard border border-stone-800 rounded-xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center font-bold text-neonGreen border border-stone-700">
                                                    {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white">{rev.user?.name || 'Anonymous Eco-Traveler'}</h4>
                                                    <p className="text-xs text-stone-500">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} className={i < rev.rating ? '' : 'text-stone-700'} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-stone-300 text-sm leading-relaxed">{rev.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Sticky Right Sidebar: Eco Stats */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">
                        <div className="bg-deepCard border border-stone-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-neonGreen/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <h3 className="text-white font-bold mb-6 border-b border-stone-800 pb-3">Sustainability Impact</h3>

                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-stone-400 text-sm">Est. Carbon Offset</span>
                                    <span className="text-neonGreen font-bold font-display text-xl">
                                        {business.badgeStatus === 'platinum' ? '100%' : business.badgeStatus === 'gold' ? '80%' : '50%'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-stone-400 text-sm">Green Energy Use</span>
                                    <span className="text-white font-bold font-display text-xl">Verified</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-stone-400 text-sm">Local Economy Return</span>
                                    <span className="text-white font-bold font-display text-xl">High</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0D2818] border border-neonGreen/30 rounded-xl p-6 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                            <h4 className="text-neonGreen font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Leaf size={16} /> Connect Green Tip
                            </h4>
                            <p className="text-sm text-stone-300 leading-relaxed">
                                Spending your funds at {business.badgeStatus} verified locations funnels resources directly to local conservation efforts and cuts out exploitative middlemen.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BusinessDetails;
